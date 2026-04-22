import { cookies } from "next/headers";
import { getFirebaseAdminAuth } from "@/lib/firebase-admin";
import pool from "@/lib/db";
import { syncFirebaseUserToDb } from "@/lib/auth-user-sync";

export const APP_SESSION_COOKIE = "elefind_session";

export interface AppAuthUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  firebaseUid: string;
}

export async function getServerAuthUser(): Promise<AppAuthUser | null> {
  const cookieStore = await cookies();
  return getServerAuthUserFromSessionCookie(cookieStore.get(APP_SESSION_COOKIE)?.value ?? null);
}

export async function getServerAuthUserFromRequest(request: Request): Promise<AppAuthUser | null> {
  return getServerAuthUserFromSessionCookie(
    "cookies" in request ? (request as { cookies: { get: (name: string) => { value: string } | undefined } }).cookies.get(APP_SESSION_COOKIE)?.value ?? null : null
  );
}

async function getServerAuthUserFromSessionCookie(
  sessionCookie: string | null
): Promise<AppAuthUser | null> {
  if (!sessionCookie) {
    return null;
  }

  try {
    const firebaseAdminAuth = getFirebaseAdminAuth();
    const decoded = await firebaseAdminAuth.verifySessionCookie(sessionCookie, true);
    if (!decoded.email) {
      return null;
    }

    const lookupByUid = await pool.query(
      `SELECT id, email, name, role, firebase_uid
       FROM users
       WHERE firebase_uid = $1
       LIMIT 1`,
      [decoded.uid]
    );

    const row = (lookupByUid.rows[0] as {
      id: string;
      email: string;
      name: string | null;
      role: string;
      firebase_uid: string | null;
    } | undefined) ?? null;

    if (row?.firebase_uid) {
      return {
        id: row.id,
        email: row.email,
        name: row.name,
        role: row.role,
        firebaseUid: row.firebase_uid,
      };
    }

    const synced = await syncFirebaseUserToDb({
      firebaseUid: decoded.uid,
      email: decoded.email,
      name: typeof decoded.name === "string" ? decoded.name : null,
      emailVerified: Boolean(decoded.email_verified),
      provider: decoded.firebase?.sign_in_provider ?? "firebase",
    });

    return {
      id: synced.id,
      email: synced.email,
      name: synced.name,
      role: synced.role,
      firebaseUid: decoded.uid,
    };
  } catch {
    return null;
  }
}

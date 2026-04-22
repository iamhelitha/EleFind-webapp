import { cookies } from "next/headers";
import pool from "@/lib/db";
import { syncFirebaseUserToDb } from "@/lib/auth-user-sync";
import { getAppSessionCookieName, verifyAppSessionToken } from "@/lib/auth-session";

export const APP_SESSION_COOKIE = getAppSessionCookieName();

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
    const decoded = await verifyAppSessionToken(sessionCookie);

    const lookupByUid = await pool.query(
      `SELECT id, email, name, role, firebase_uid
       FROM users
       WHERE firebase_uid = $1
       LIMIT 1`,
      [decoded.firebaseUid]
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
      firebaseUid: decoded.firebaseUid,
      email: decoded.email,
      name: decoded.name,
      emailVerified: true,
      provider: decoded.provider,
    });

    return {
      id: synced.id,
      email: synced.email,
      name: synced.name,
      role: synced.role,
      firebaseUid: decoded.firebaseUid,
    };
  } catch {
    return null;
  }
}

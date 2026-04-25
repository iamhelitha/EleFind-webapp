import { cookies } from "next/headers";
import { getSession } from "./db-sessions";

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
  const token = cookieStore.get(APP_SESSION_COOKIE)?.value ?? null;
  return resolveSession(token);
}

export async function getServerAuthUserFromRequest(request: Request): Promise<AppAuthUser | null> {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const token = parseCookieHeader(cookieHeader, APP_SESSION_COOKIE);
  return resolveSession(token);
}

async function resolveSession(token: string | null): Promise<AppAuthUser | null> {
  if (!token) return null;
  try {
    const session = await getSession(token);
    if (!session) return null;
    return {
      id: session.user_id,
      email: session.email,
      name: session.name,
      role: session.role,
      firebaseUid: session.firebase_uid,
    };
  } catch {
    return null;
  }
}

function parseCookieHeader(header: string, name: string): string | null {
  for (const part of header.split(";")) {
    const trimmed = part.trim();
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    if (trimmed.slice(0, eqIdx).trim() === name) {
      return decodeURIComponent(trimmed.slice(eqIdx + 1).trim());
    }
  }
  return null;
}

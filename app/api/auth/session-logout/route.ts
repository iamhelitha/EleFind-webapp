import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getFirebaseAdminAuth } from "@/lib/firebase-admin";
import { APP_SESSION_COOKIE } from "@/lib/server-auth";

export async function POST() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(APP_SESSION_COOKIE)?.value;

  const response = NextResponse.json({ success: true });
  response.cookies.set(APP_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  if (!sessionCookie) {
    return response;
  }

  try {
    const firebaseAdminAuth = getFirebaseAdminAuth();
    const decoded = await firebaseAdminAuth.verifySessionCookie(sessionCookie);
    await firebaseAdminAuth.revokeRefreshTokens(decoded.sub);
  } catch {
    // Intentionally ignore revoke errors during logout.
  }

  return response;
}

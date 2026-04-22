import { NextRequest, NextResponse } from "next/server";
import { getFirebaseAdminAuth } from "@/lib/firebase-admin";
import { APP_SESSION_COOKIE } from "@/lib/server-auth";
import { syncFirebaseUserToDb } from "@/lib/auth-user-sync";

interface SessionLoginBody {
  idToken?: unknown;
  provider?: unknown;
}

const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 5;

function validateRequestOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) {
    return true;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    return new URL(origin).origin === new URL(appUrl).origin;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  if (!validateRequestOrigin(request)) {
    return NextResponse.json({ success: false, error: "Invalid request origin." }, { status: 403 });
  }

  try {
    const firebaseAdminAuth = getFirebaseAdminAuth();
    const body = (await request.json()) as SessionLoginBody;
    if (typeof body.idToken !== "string" || body.idToken.length < 20) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid ID token." },
        { status: 400 }
      );
    }

    const decoded = await firebaseAdminAuth.verifyIdToken(body.idToken, true);

    if (!decoded.email) {
      return NextResponse.json(
        { success: false, error: "Authenticated user is missing an email." },
        { status: 400 }
      );
    }

    const authTime = typeof decoded.auth_time === "number" ? decoded.auth_time : 0;
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (nowSeconds - authTime > 5 * 60) {
      return NextResponse.json(
        { success: false, error: "Recent sign-in required." },
        { status: 401 }
      );
    }

    const provider = typeof body.provider === "string" ? body.provider : "password";

    let syncedUser;
    try {
      syncedUser = await syncFirebaseUserToDb({
        firebaseUid: decoded.uid,
        email: decoded.email,
        name: typeof decoded.name === "string" ? decoded.name : null,
        emailVerified: Boolean(decoded.email_verified),
        provider,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "ACCOUNT_LINK_CONFLICT") {
        return NextResponse.json(
          {
            success: false,
            error:
              "This email is already linked to another account. Please contact support.",
          },
          { status: 409 }
        );
      }
      throw error;
    }

    const sessionCookie = await firebaseAdminAuth.createSessionCookie(body.idToken, {
      expiresIn: SESSION_MAX_AGE_MS,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: syncedUser.id,
        email: syncedUser.email,
        name: syncedUser.name,
        role: syncedUser.role,
        firebaseUid: decoded.uid,
      },
    });

    response.cookies.set(APP_SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: Math.floor(SESSION_MAX_AGE_MS / 1000),
    });

    return response;
  } catch (error) {
    console.error("[session-login]", error);
    return NextResponse.json(
      { success: false, error: "Unable to create session." },
      { status: 500 }
    );
  }
}

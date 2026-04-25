import { NextRequest, NextResponse } from "next/server";
import { APP_SESSION_COOKIE } from "@/lib/server-auth";
import { syncFirebaseUserToDb } from "@/lib/auth-user-sync";
import { createSession, SESSION_MAX_AGE_SECONDS } from "@/lib/db-sessions";
import { verifyFirebaseIdToken } from "@/lib/firebase-id-token";

interface SessionLoginBody {
  idToken?: unknown;
  provider?: unknown;
}

function validateRequestOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  try {
    return new URL(origin).origin === new URL(appUrl).origin;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  if (!validateRequestOrigin(request)) {
    return NextResponse.json(
      { success: false, error: "Invalid request origin." },
      { status: 403 }
    );
  }

  try {
    const body = (await request.json()) as SessionLoginBody;
    if (typeof body.idToken !== "string" || body.idToken.length < 20) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid ID token." },
        { status: 400 }
      );
    }

    const decoded = await verifyFirebaseIdToken(body.idToken);
    const provider = typeof body.provider === "string" ? body.provider : "password";

    let syncedUser;
    try {
      syncedUser = await syncFirebaseUserToDb({
        firebaseUid: decoded.uid,
        email: decoded.email,
        name: decoded.name,
        emailVerified: decoded.emailVerified,
        provider,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "ACCOUNT_LINK_CONFLICT") {
        return NextResponse.json(
          {
            success: false,
            error: "This email is already linked to another account. Please contact support.",
          },
          { status: 409 }
        );
      }
      throw error;
    }

    const token = await createSession({
      userId: syncedUser.id,
      firebaseUid: decoded.uid,
      email: decoded.email,
      name: decoded.name,
      role: syncedUser.role,
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

    response.cookies.set(APP_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
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

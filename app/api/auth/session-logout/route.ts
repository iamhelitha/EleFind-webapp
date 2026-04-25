import { NextRequest, NextResponse } from "next/server";
import { APP_SESSION_COOKIE } from "@/lib/server-auth";
import { deleteSession } from "@/lib/db-sessions";

export async function POST(request: NextRequest) {
  const token = request.cookies.get(APP_SESSION_COOKIE)?.value;
  if (token) {
    await deleteSession(token).catch(() => undefined);
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(APP_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}

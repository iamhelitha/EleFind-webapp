import { NextResponse } from "next/server";
import { APP_SESSION_COOKIE } from "@/lib/server-auth";

export async function POST() {
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

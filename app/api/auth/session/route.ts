import { NextResponse } from "next/server";
import { getServerAuthUser } from "@/lib/server-auth";

export async function GET() {
  const user = await getServerAuthUser();

  if (!user) {
    return NextResponse.json({ success: false, user: null }, { status: 401 });
  }

  return NextResponse.json({ success: true, user });
}

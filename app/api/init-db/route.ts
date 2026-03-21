import { initDb } from "@/lib/db-init";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    await initDb();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[init-db]", error);
    return NextResponse.json(
      { error: "Failed to initialise database." },
      { status: 500 }
    );
  }
}

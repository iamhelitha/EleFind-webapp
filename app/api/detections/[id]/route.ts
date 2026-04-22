import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getServerAuthUserFromRequest } from "@/lib/server-auth";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getServerAuthUserFromRequest(_req);
  if (!user || user.role !== "officer") {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await pool.query(`DELETE FROM detections WHERE id = $1`, [id]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[detections DELETE]", error);
    return NextResponse.json({ error: "Failed to delete." }, { status: 500 });
  }
}

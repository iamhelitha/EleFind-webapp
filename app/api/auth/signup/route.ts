import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";

interface SignupRequest {
  name?: unknown;
  email?: unknown;
  password?: unknown;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SignupRequest;
    const { name, email, password } = body;

    // Validation
    if (typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Name is required." },
        { status: 400 }
      );
    }

    if (typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format." },
        { status: 400 }
      );
    }

    if (typeof password !== "string" || !password) {
      return NextResponse.json(
        { error: "Password is required." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: "Email is already registered." },
        { status: 400 }
      );
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const userId = crypto.randomUUID();
    await pool.query(
      `INSERT INTO users (id, email, name, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, email.toLowerCase(), name.trim(), passwordHash, "public"]
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("[signup] Error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}

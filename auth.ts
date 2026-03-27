import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const result = await pool.query(
          "SELECT * FROM users WHERE email = $1",
          [credentials.email]
        );
        const user = result.rows[0];
        if (!user) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password_hash
        );
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const email = user.email;
        if (!email) return false;

        try {
          const existing = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
          );

          if (existing.rows.length === 0) {
            const id = crypto.randomUUID();
            await pool.query(
              `INSERT INTO users (id, email, name, password_hash, role)
               VALUES ($1, $2, $3, $4, $5)`,
              [id, email, user.name ?? email.split("@")[0], "google-oauth", "public"]
            );
          }
        } catch (err) {
          console.error("[auth] Google signIn DB error:", err);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user && account?.provider === "credentials") {
        token.role = user.role;
      } else if (account?.provider === "google") {
        // Look up role from DB for Google users
        const result = await pool.query(
          "SELECT role FROM users WHERE email = $1",
          [token.email]
        );
        token.role = result.rows[0]?.role ?? "public";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.role = token.role as string | undefined;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
});

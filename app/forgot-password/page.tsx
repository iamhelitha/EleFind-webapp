"use client";

import { useState } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import Spinner from "@/components/ui/Spinner";
import { getFirebaseAuth } from "@/lib/firebase-client";
import { getFirebaseAuthErrorMessage } from "@/lib/firebase-auth-errors";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    setLoading(true);

    try {
      await sendPasswordResetEmail(getFirebaseAuth(), email.trim());
      setMessage(
        "If an account exists for this email, a password reset link has been sent."
      );
    } catch (err) {
      setError(
        getFirebaseAuthErrorMessage(
          err,
          "If an account exists for this email, a password reset link has been sent."
        )
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-2xl font-bold text-green-900">
            Reset Password
          </h1>
          <p className="mt-1 text-sm text-muted">
            Enter your email and we will send a reset link.
          </p>
        </div>

        <div className="rounded-2xl border border-card-border bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-green-900"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-card-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="officer@elefind.lk"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            {message && (
              <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-60 transition-colors"
            >
              {loading ? (
                <>
                  <Spinner size="sm" />
                  Sending link...
                </>
              ) : (
                "Send reset link"
              )}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-muted">
          Remembered your password?{" "}
          <Link href="/login" className="font-medium text-green-700 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

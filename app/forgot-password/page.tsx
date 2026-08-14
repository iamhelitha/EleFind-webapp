"use client";

import { useState } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import Spinner from "@/components/ui/Spinner";
import AuthShell from "@/components/auth/AuthShell";
import AuthField, { AuthError, AuthNotice } from "@/components/auth/AuthField";
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
        "If an account exists for this email, a password reset link has been sent. Check spam if it hasn't arrived in two minutes."
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
    <AuthShell
      kicker="Forgot password"
      heading="Reset by email"
      description="We'll send a one-time link. It expires in 30 minutes and can be used once."
      footer={
        <Link href="/login" className="font-semibold text-accent-700">
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <AuthField
          id="email"
          label="Email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.lk"
        />

        {error && <AuthError>{error}</AuthError>}
        {message && <AuthNotice>{message}</AuthNotice>}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-sand transition-colors hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {loading ? (
            <>
              <Spinner size="sm" />
              Sending link…
            </>
          ) : (
            "Send reset link"
          )}
        </button>
      </form>
    </AuthShell>
  );
}

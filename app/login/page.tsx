"use client";

import { useState } from "react";
import Link from "next/link";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import Spinner from "@/components/ui/Spinner";
import AuthShell from "@/components/auth/AuthShell";
import AuthField, { AuthError } from "@/components/auth/AuthField";
import { getFirebaseAuth } from "@/lib/firebase-client";
import { getFirebaseAuthErrorMessage } from "@/lib/firebase-auth-errors";

async function exchangeFirebaseSession(idToken: string) {
  const response = await fetch("/api/auth/session-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ idToken, provider: "password" }),
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error ?? "Unable to establish session.");
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const auth = getFirebaseAuth();
    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      const idToken = await credential.user.getIdToken(true);
      await exchangeFirebaseSession(idToken);
      window.location.href = "/map";
    } catch (err) {
      await signOut(auth).catch(() => undefined);
      setError(
        getFirebaseAuthErrorMessage(err, "Unable to sign in. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      kicker="Sign in"
      heading="Welcome back"
      footer={
        <>
          New here?{" "}
          <Link href="/signup" className="font-semibold text-accent-700">
            Create an account
          </Link>
        </>
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
          placeholder="officer@dwc.gov.lk"
        />

        <AuthField
          id="password"
          label="Password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-[12.5px] font-medium text-accent-700"
          >
            Forgot password?
          </Link>
        </div>

        {error && <AuthError>{error}</AuthError>}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-sand transition-colors hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {loading ? (
            <>
              <Spinner size="sm" />
              Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </form>
    </AuthShell>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import {
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import Spinner from "@/components/ui/Spinner";
import AuthShell from "@/components/auth/AuthShell";
import AuthField, { AuthError, AuthNotice } from "@/components/auth/AuthField";
import { getFirebaseAuth } from "@/lib/firebase-client";
import { getFirebaseAuthErrorMessage } from "@/lib/firebase-auth-errors";

/**
 * Account types shown at sign-up.
 *
 * Every account is created with community access. The officer role is
 * granted manually by an administrator afterwards, so this choice sets
 * expectations rather than requesting a privilege — see the notice
 * rendered when "officer" is selected.
 */
type AccountIntent = "community" | "officer";

const ACCOUNT_TYPES: ReadonlyArray<{
  value: AccountIntent;
  title: string;
  description: string;
}> = [
  {
    value: "community",
    title: "Community member",
    description: "Get alerts, log sightings, confirm zones",
  },
  {
    value: "officer",
    title: "Wildlife officer",
    description: "Verify records and see precise coordinates",
  },
];

const MIN_PASSWORD_LENGTH = 8;

/** Rough 0–4 strength score used only to drive the meter. */
function scorePassword(password: string): number {
  if (!password) return 0;

  const checks = [
    password.length >= MIN_PASSWORD_LENGTH,
    password.length >= 12,
    /[a-z]/.test(password) && /[A-Z]/.test(password),
    /\d/.test(password) || /[^A-Za-z0-9]/.test(password),
  ];

  return checks.filter(Boolean).length;
}

const STRENGTH_LABEL = ["", "weak", "fair", "good", "strong"] as const;

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

export default function SignupPage() {
  const [intent, setIntent] = useState<AccountIntent>("community");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const strength = scorePassword(password);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Password is required.");
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const auth = getFirebaseAuth();

    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const trimmedName = name.trim();
      if (trimmedName) {
        await updateProfile(credential.user, { displayName: trimmedName });
      }

      const idToken = await credential.user.getIdToken(true);
      await exchangeFirebaseSession(idToken);
      window.location.href = "/map";
    } catch (err) {
      await signOut(auth).catch(() => undefined);
      setError(
        getFirebaseAuthErrorMessage(err, "Sign up failed. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      kicker="Sign up"
      heading="Join the record"
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-accent-700">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
          <legend className="mb-1 p-0 text-xs text-[rgba(32,30,29,0.7)]">
            I am a…
          </legend>
          {ACCOUNT_TYPES.map(({ value, title, description }) => {
            const selected = intent === value;
            return (
              <label
                key={value}
                className={`flex cursor-pointer items-start gap-3 rounded-[22px] bg-sand px-3.5 py-3 transition-colors ${
                  selected
                    ? "border-[1.5px] border-accent"
                    : "border-[1.5px] border-divider"
                }`}
              >
                <input
                  type="radio"
                  name="account-intent"
                  value={value}
                  checked={selected}
                  onChange={() => setIntent(value)}
                  className="sr-only"
                />
                <span
                  className={`mt-0.5 h-4 w-4 flex-none rounded-full border-[1.5px] ${
                    selected
                      ? "border-accent bg-accent shadow-[inset_0_0_0_3.5px_var(--sand)]"
                      : "border-divider"
                  }`}
                />
                <span>
                  <span className="block text-[13.5px] font-semibold">
                    {title}
                  </span>
                  <span className="text-[11.5px] text-[rgba(32,30,29,0.6)]">
                    {description}
                  </span>
                </span>
              </label>
            );
          })}
        </fieldset>

        {intent === "officer" && (
          <AuthNotice>
            Officer access is reviewed manually. Create your account here first —
            it starts with community access, and an administrator raises the
            role once your department email is verified.
          </AuthNotice>
        )}

        <AuthField
          id="name"
          label="Full name"
          type="text"
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nadeesha Perera"
        />

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

        <div>
          <AuthField
            id="password"
            label="Password"
            type="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
          <div className="mt-2 flex gap-1" aria-hidden="true">
            {[0, 1, 2, 3].map((step) => (
              <span
                key={step}
                className={`h-[3px] flex-1 rounded-full ${
                  step < strength ? "bg-sage-500" : "bg-neutral-300"
                }`}
              />
            ))}
          </div>
          <span className="mono mt-1.5 block text-[10.5px] text-[rgba(32,30,29,0.55)]">
            {password
              ? `${STRENGTH_LABEL[strength]} · ${MIN_PASSWORD_LENGTH}+ characters`
              : `at least ${MIN_PASSWORD_LENGTH} characters`}
          </span>
        </div>

        <AuthField
          id="confirmPassword"
          label="Confirm password"
          type="password"
          required
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
        />

        {error && <AuthError>{error}</AuthError>}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-sand transition-colors hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {loading ? (
            <>
              <Spinner size="sm" />
              Creating account…
            </>
          ) : (
            "Create account"
          )}
        </button>
      </form>
    </AuthShell>
  );
}

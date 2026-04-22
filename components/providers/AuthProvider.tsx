"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase-client";
import type { AppAuthUser } from "@/lib/server-auth";

interface AuthContextValue {
  user: AppAuthUser | null;
  loading: boolean;
  refreshSession: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchSession(): Promise<AppAuthUser | null> {
  const response = await fetch("/api/auth/session", {
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const body = (await response.json()) as {
    success: boolean;
    user: AppAuthUser | null;
  };

  return body.success ? body.user : null;
}

async function exchangeIdTokenForSession(): Promise<void> {
  const firebaseUser = getFirebaseAuth().currentUser;
  if (!firebaseUser) {
    return;
  }

  const idToken = await firebaseUser.getIdToken();
  const response = await fetch("/api/auth/session-login", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      idToken,
      provider: firebaseUser.providerData[0]?.providerId ?? "password",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to establish server session from Firebase token.");
  }
}

export function AppAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppAuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    const serverUser = await fetchSession();
    setUser(serverUser);
  }, []);

  const signOut = useCallback(async () => {
    await firebaseSignOut(getFirebaseAuth());
    await fetch("/api/auth/session-logout", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
  }, []);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    try {
      const auth = getFirebaseAuth();
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        try {
          if (!firebaseUser) {
            await fetch("/api/auth/session-logout", {
              method: "POST",
              credentials: "include",
            });
            setUser(null);
            return;
          }

          await exchangeIdTokenForSession();
          const serverUser = await fetchSession();
          setUser(serverUser);
        } catch {
          await firebaseSignOut(auth).catch(() => undefined);
          setUser(null);
        } finally {
          setLoading(false);
        }
      });
    } catch {
      setUser(null);
      setLoading(false);
      return;
    }

    return () => unsubscribe?.();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      refreshSession,
      signOut,
    }),
    [loading, refreshSession, signOut, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAppAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAppAuth must be used within AppAuthProvider");
  }
  return context;
}

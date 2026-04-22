"use client";

import { AppAuthProvider } from "@/components/providers/AuthProvider";

export default function AuthSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppAuthProvider>{children}</AppAuthProvider>;
}

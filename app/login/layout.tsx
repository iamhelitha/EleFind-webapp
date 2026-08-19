import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Sign In",
  description: "Sign in to your EleFind account.",
  path: "/login",
  index: false,
});

export default function LoginLayout({ children }: { children: ReactNode }) {
  return children;
}

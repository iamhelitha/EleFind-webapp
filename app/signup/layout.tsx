import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Create an Account",
  description: "Create an EleFind community or wildlife-officer account.",
  path: "/signup",
  index: false,
});

export default function SignupLayout({ children }: { children: ReactNode }) {
  return children;
}

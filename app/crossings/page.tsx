import { redirect } from "next/navigation";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Elephant Crossing Zones",
  description: "Elephant crossing zones are available on the unified EleFind map.",
  path: "/crossings",
  index: false,
});

/**
 * Crossings page now redirects to the unified map page,
 * where crossing zone management is integrated.
 */
export default function CrossingsPage() {
  redirect("/map");
}

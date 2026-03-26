import { redirect } from "next/navigation";

/**
 * Crossings page now redirects to the unified map page,
 * where crossing zone management is integrated.
 */
export default function CrossingsPage() {
  redirect("/map");
}

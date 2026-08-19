import { createOgImage, OG_SIZE } from "@/lib/og-image";

export const alt =
  "EleFind aerial elephant detection and conservation mapping platform";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return createOgImage({
    eyebrow: "AI elephant detection",
    title: "Find the herd before the village does.",
    description:
      "Turn high-resolution drone surveys into reviewable elephant detections and mapped conservation evidence.",
  });
}

import { createOgImage, OG_SIZE } from "@/lib/og-image";

export const alt = "EleFind YOLO26s launch evaluation report";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return createOgImage({
    eyebrow: "Held-out model evaluation",
    title: "EleFind YOLO26s",
    description:
      "Held-out point evaluation, tiled-inference settings, altitude-aware analysis, and a direct YOLO11s baseline comparison.",
    metrics: [
      { value: "0.9002", label: "point AP" },
      { value: "439", label: "test images" },
      { value: "0.8896", label: "best F1" },
    ],
  });
}

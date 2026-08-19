import { createOgImage, OG_SIZE } from "@/lib/og-image";

export const alt = "EleFind YOLO11 model evaluation report";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return createOgImage({
    eyebrow: "Model evaluation report",
    title: "EleFind YOLO11",
    description:
      "Training curves, evaluation metrics, SAHI settings, limitations, and a direct YOLO26s comparison.",
    metrics: [
      { value: "84.3%", label: "mAP@0.5" },
      { value: "50", label: "test images" },
      { value: "51.0%", label: "F1 score" },
    ],
  });
}

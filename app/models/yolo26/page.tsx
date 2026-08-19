import ModelReport from "@/components/models/ModelReport";
import JsonLd from "@/components/seo/JsonLd";
import { absoluteUrl, createPageMetadata } from "@/lib/seo";

const pageDescription =
  "Review EleFind YOLO26s held-out aerial elephant detection metrics, tiled-inference settings, altitude-aware analysis, limitations, and YOLO11s comparison.";

export const metadata = createPageMetadata({
  title: "YOLO26s Aerial Elephant Detection Model Report",
  description: pageDescription,
  path: "/models/yolo26",
  image: "/models/yolo26/opengraph-image",
  imageAlt: "EleFind YOLO26s launch-ready aerial elephant detection report",
  keywords: [
    "YOLO26 elephant detection",
    "aerial elephant detection model",
    "YOLO26s model metrics",
    "point AP elephant detection",
  ],
});

const reportJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: "EleFind YOLO26s Aerial Elephant Detection Model Report",
    description: pageDescription,
    url: absoluteUrl("/models/yolo26"),
    image: absoluteUrl("/models/yolo26/opengraph-image"),
    inLanguage: "en",
    author: { "@type": "Person", name: "Helitha Guruge" },
    about: {
      "@type": "SoftwareApplication",
      name: "EleFind YOLO26s",
      applicationCategory: "ScienceApplication",
      operatingSystem: "Any",
      additionalProperty: [
        { "@type": "PropertyValue", name: "Point AP at 2.25 m", value: "0.9002" },
        { "@type": "PropertyValue", name: "Best F1", value: "0.8896" },
        { "@type": "PropertyValue", name: "Precision", value: "0.9168" },
        { "@type": "PropertyValue", name: "Recall", value: "0.8640" },
      ],
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "EleFind",
        item: absoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "YOLO26s model report",
        item: absoluteUrl("/models/yolo26"),
      },
    ],
  },
];

const comparisonImage = {
  src: "/images/yolo26/scoring-comparison.png",
  width: 1609,
  height: 807,
  title: "Evaluation-rule comparison",
  body: "Point-distance scoring remains stable across tolerances, while box mAP changes sharply when different synthetic box conventions are applied to the same source annotations.",
};

export default function Yolo26ModelPage() {
  return (
    <>
      <JsonLd data={reportJsonLd} />
      <ModelReport
      version="YOLO26s"
      status="Evaluation complete · launch ready"
      title="EleFind YOLO26s"
      summary="A 9.95-million-parameter, single-class elephant detector fully fine-tuned for nadir aerial photography. Its launch evaluation uses held-out source photographs, metre-based point matching, altitude-aware box analysis, and a direct YOLO11s baseline comparison."
      metrics={[
        { value: "0.9002", label: "Point AP", note: "2.25 m tolerance" },
        { value: "0.8896", label: "Best F1", note: "confidence 0.50" },
        { value: "0.9168", label: "Precision", note: "at best F1" },
        { value: "0.8640", label: "Recall", note: "at best F1" },
      ]}
      metricQualifier="Point AP is the primary metric because the source dataset provides elephant centre points rather than measured ground-truth boxes. All headline test results use cross-tile NMS/IOU after tiled inference on held-out full-resolution photographs."
      facts={[
        {
          value: "439",
          label: "Full-resolution test images",
          detail: "438 annotated source photos plus one negative image, held out from model training.",
        },
        {
          value: "2,970",
          label: "Test elephant points",
          detail: "Centre-point annotations scored at 1.0 m, 2.25 m, and 4.5 m matching tolerances.",
        },
        {
          value: "17,385",
          label: "Training tiles",
          detail: "5,795 positive and 11,590 background tiles derived from 1,304 source photos.",
        },
        {
          value: "9.95 M",
          label: "Parameters",
          detail: "A compact 19.5 MB model with all 902 layers transferred for full fine-tuning.",
        },
      ]}
      settings={[
        ["Required slice size", "1024 × 1024 px"],
        ["Required overlap", "0.30"],
        ["Inference confidence", "0.30"],
        ["Best-F1 confidence", "0.50"],
        ["Cross-tile post-process", "NMS / IOU"],
        ["Post-process threshold", "0.40"],
        ["RTX 3060 · 20 MP", "≈3.2 s"],
        ["CPU · 20 MP", "≈14.4 s"],
      ]}
      graphs={[
        {
          src: "/images/yolo26/pr-curve.png",
          width: 1009,
          height: 743,
          title: "Point-based precision–recall",
          body: "Primary evaluation at three metre-based centre-matching tolerances; AP reaches 0.9002 at 2.25 m.",
        },
        {
          src: "/images/yolo26/confidence-sweep.png",
          width: 993,
          height: 743,
          title: "Confidence sweep",
          body: "Precision, recall, and F1 across confidence thresholds. Best F1 is 0.8896 at confidence 0.50.",
        },
        {
          src: "/images/yolo26/box-size-tracking.png",
          width: 999,
          height: 769,
          title: "Altitude-aware predicted boxes",
          body: "Predicted box width follows the elephant size implied by each photograph's ground sampling distance.",
        },
        {
          src: "/images/yolo26/box-map-conventions.png",
          width: 1461,
          height: 710,
          title: "Synthetic-box metric sensitivity",
          body: "IoU-based scores change materially when different invented box sizes are wrapped around point annotations.",
        },
      ]}
      interpretation={[
        "At the 2.25 m operating tolerance, the detector records 2,566 true positives, 233 false positives, and 404 false negatives.",
        "Direct full-image inference is not supported: recall drops to roughly 0.1% when a full survey image is resized instead of tiled.",
        "NMS/IOU is the recommended cross-tile merge rule. The default greedy merge produced lower point AP and lower maximum recall in this evaluation.",
      ]}
      comparisonIntro="Both models below were evaluated on the same held-out source photographs using the same tiled pipeline and metre-based matching. YOLO26s makes a modest point-metric gain, while its adaptive predicted boxes produce a much stronger result under the 4.5 m synthetic-box convention."
      comparisonRows={[
        { label: "Point AP @ 2.25 m", yolo11: 0.8962, yolo26: 0.9002 },
        { label: "Best F1", yolo11: 0.8854, yolo26: 0.8896 },
        { label: "Synthetic-box mAP@0.5", yolo11: 0.1221, yolo26: 0.8584 },
      ]}
      comparisonImage={comparisonImage}
      limitations={[
        "Tiled inference is required for full-resolution survey photographs.",
        "The evaluated altitude range corresponds to 0.024–0.130 m per pixel.",
        "Domain shift beyond aerial savanna and bushland can reduce performance.",
        "Outputs require human verification before census or enforcement use.",
      ]}
      otherModel={{ href: "/models/yolo11", label: "Read the YOLO11 report" }}
      />
    </>
  );
}

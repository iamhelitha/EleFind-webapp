import ModelReport from "@/components/models/ModelReport";
import JsonLd from "@/components/seo/JsonLd";
import { absoluteUrl, createPageMetadata } from "@/lib/seo";

const pageDescription =
  "Explore EleFind YOLO11 training curves, aerial elephant detection metrics, SAHI inference settings, limitations, and a direct YOLO26s comparison.";

export const metadata = createPageMetadata({
  title: "YOLO11 Aerial Elephant Detection Model Report",
  description: pageDescription,
  path: "/models/yolo11",
  image: "/models/yolo11/opengraph-image",
  imageAlt: "EleFind YOLO11 aerial elephant detection model report",
  keywords: [
    "YOLO11 elephant detection",
    "aerial elephant detection model",
    "YOLO11 model metrics",
    "SAHI elephant detection",
  ],
});

const reportJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: "EleFind YOLO11 Aerial Elephant Detection Model Report",
    description: pageDescription,
    url: absoluteUrl("/models/yolo11"),
    image: absoluteUrl("/models/yolo11/opengraph-image"),
    inLanguage: "en",
    author: { "@type": "Person", name: "Helitha Guruge" },
    about: {
      "@type": "SoftwareApplication",
      name: "EleFind YOLO11",
      applicationCategory: "ScienceApplication",
      operatingSystem: "Any",
      additionalProperty: [
        { "@type": "PropertyValue", name: "mAP@0.5", value: "84.3%" },
        { "@type": "PropertyValue", name: "Precision", value: "53.2%" },
        { "@type": "PropertyValue", name: "Recall", value: "49.1%" },
        { "@type": "PropertyValue", name: "F1 score", value: "51.0%" },
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
        name: "YOLO11 model report",
        item: absoluteUrl("/models/yolo11"),
      },
    ],
  },
];

const comparisonImage = {
  src: "/images/yolo26/scoring-comparison.png",
  width: 1609,
  height: 807,
  title: "Point scoring is more stable than invented boxes",
  body: "The same detections produce very different IoU scores when synthetic box size changes. Metre-based centre matching stays aligned with the source point annotations.",
};

export default function Yolo11ModelPage() {
  return (
    <>
      <JsonLd data={reportJsonLd} />
      <ModelReport
      version="YOLO11"
      status="Deployed research model"
      title="EleFind YOLO11"
      summary="The first EleFind aerial elephant detector combines a single-class YOLO11 model with tiled inference for high-resolution drone imagery. This report preserves the complete published 50-image evaluation and places it beside the newer, larger comparison study."
      metrics={[
        { value: "84.3%", label: "mAP@0.5", note: "50-image test set" },
        { value: "53.2%", label: "Precision", note: "published test result" },
        { value: "49.1%", label: "Recall", note: "published test result" },
        { value: "51.0%", label: "F1 score", note: "precision–recall balance" },
      ]}
      metricQualifier="These headline values come from the original model's 50-image test set. They are self-reported research results, not a guarantee of field performance. The model-to-model comparison below uses a separate held-out evaluation with a retrained YOLO11s fixed-box baseline."
      facts={[
        {
          value: "50",
          label: "Test images",
          detail: "The original evaluation set used for the published precision, recall, F1, and mAP values.",
        },
        {
          value: "185 / 163 / 192",
          label: "TP / FP / FN",
          detail: "Detected elephants, false detections, and missed elephants at the reported operating point.",
        },
        {
          value: "1 class",
          label: "Elephant detector",
          detail: "Fine-tuned for elephants in overhead aerial and drone photographs.",
        },
        {
          value: "100",
          label: "Training epochs",
          detail: "Early stopping used a patience of 20 epochs, with automatic mixed precision enabled.",
        },
      ]}
      settings={[
        ["Input and slice size", "1024 × 1024 px"],
        ["Slice overlap", "0.30"],
        ["Confidence threshold", "0.30"],
        ["Cross-tile NMS IoU", "0.40"],
        ["Training batch size", "16"],
        ["Initial learning rate", "0.01"],
        ["Augmentation", "Mosaic · erase · flip"],
        ["Intended view", "Overhead / nadir"],
      ]}
      graphs={[
        {
          src: "/images/yolo11/training-curves.png",
          width: 2400,
          height: 1200,
          title: "Training progression",
          body: "Box and classification loss alongside precision, recall, and mAP over the full training run.",
          wide: true,
        },
        {
          src: "/images/yolo11/confusion-matrix.png",
          width: 3000,
          height: 2250,
          title: "Normalised confusion matrix",
          body: "Shows correct elephant detections as well as confusion with the background class.",
        },
        {
          src: "/images/yolo11/precision-recall.png",
          width: 2250,
          height: 1500,
          title: "Precision–recall curve",
          body: "The area under this curve produces the reported 0.843 mAP@0.5 result.",
        },
      ]}
      interpretation={[
        "The high mAP@0.5 shows that the detector can rank useful candidates, while the lower operating-point precision and recall show that thresholding and review still matter.",
        "Tiling is part of the model workflow: shrinking an entire high-resolution survey frame would make already-small elephants even harder to resolve.",
        "The test set is small. Treat these numbers as an initial research result and use the larger held-out comparison below for model-generation comparisons.",
      ]}
      comparisonIntro="For an apples-to-apples generation comparison, YOLO26s was evaluated beside a separately trained YOLO11s fixed-box baseline on the same held-out Aerial Elephant Dataset photos. That comparison is distinct from the 50-image YOLO11 report above."
      comparisonRows={[
        { label: "Point AP @ 2.25 m", yolo11: 0.8962, yolo26: 0.9002 },
        { label: "Best F1", yolo11: 0.8854, yolo26: 0.8896 },
        { label: "Synthetic-box mAP@0.5", yolo11: 0.1221, yolo26: 0.8584 },
      ]}
      comparisonImage={comparisonImage}
      limitations={[
        "The original headline metrics use only 50 test images.",
        "Dense vegetation and heavy occlusion can hide small elephants.",
        "Rocks, shadows, and similarly sized objects can create false positives.",
        "Side-angle imagery is outside the overhead-view training objective.",
      ]}
      otherModel={{ href: "/models/yolo26", label: "Read the YOLO26 report" }}
      />
    </>
  );
}

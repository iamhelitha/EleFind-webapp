/**
 * Generic card wrapper.
 *
 * Cards sit on the sand surface with a generous 26px radius — the design
 * system reserves small 4px corners for detection bounding boxes only.
 * Pass `tone="night"` for cards that float over the map / operations ground.
 */

type CardTone = "sand" | "night";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  tone?: CardTone;
}

const toneStyles: Record<CardTone, string> = {
  sand: "bg-sand-surface text-ink",
  night:
    "bg-[rgba(25,29,22,0.92)] text-night-text backdrop-blur-md border border-[rgba(240,233,217,0.10)]",
};

export default function Card({
  children,
  className = "",
  tone = "sand",
}: CardProps) {
  return (
    <div className={`rounded-card ${toneStyles[tone]} ${className}`}>
      {children}
    </div>
  );
}

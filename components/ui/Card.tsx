/**
 * Generic card wrapper with consistent shadow and border radius.
 * Used throughout the app for feature cards, stat blocks, result panels, etc.
 */

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`
        rounded-xl border border-card-border bg-card-bg
        shadow-sm transition-shadow hover:shadow-md
        ${className}
      `}
    >
      {children}
    </div>
  );
}

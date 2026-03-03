/**
 * Simple CSS spinner for loading states.
 */

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-10 w-10 border-3",
};

export default function Spinner({ size = "md", className = "" }: SpinnerProps) {
  return (
    <div
      className={`
        animate-spin rounded-full
        border-green-300 border-t-green-700
        ${sizes[size]}
        ${className}
      `}
      role="status"
      aria-label="Loading"
    />
  );
}

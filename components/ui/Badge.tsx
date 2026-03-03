/**
 * Small status badge for labels, risk levels, and counts.
 */

import type { RiskLevel } from "@/types";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "critical";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-green-100 text-green-900",
  success: "bg-risk-low/20 text-green-900",
  warning: "bg-amber-500/20 text-amber-500",
  danger: "bg-risk-high/20 text-risk-high",
  critical: "bg-risk-critical/20 text-risk-critical",
};

/** Map RiskLevel enum values to badge variants. */
export const riskVariant: Record<RiskLevel, BadgeVariant> = {
  LOW: "success",
  MEDIUM: "warning",
  HIGH: "danger",
  CRITICAL: "critical",
};

export default function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center rounded-full px-2.5 py-0.5
        text-xs font-semibold
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}

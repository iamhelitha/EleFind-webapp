/**
 * Small status badge for labels, risk levels, and counts.
 *
 * Colour meaning follows the design system: sage means confirmed / safe,
 * terracotta means action or detection, clay is reserved for CRITICAL
 * and errors. Badges are pill-shaped like every other small control.
 */

import type { RiskLevel } from "@/types";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "critical"
  | "night";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-neutral-200 text-neutral-800",
  success: "bg-sage-200 text-sage-800",
  warning: "bg-accent-200 text-accent-800",
  danger: "bg-accent-300 text-accent-900",
  critical: "bg-clay-surface text-clay-text",
  night: "bg-[rgba(240,233,217,0.12)] text-sage-300",
};

/** Map RiskLevel enum values to badge variants. */
export const riskVariant: Record<RiskLevel, BadgeVariant> = {
  LOW: "success",
  MEDIUM: "warning",
  HIGH: "danger",
  CRITICAL: "critical",
};

export default function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center rounded-full px-2.5 py-0.5
        text-[11px] font-semibold tracking-[0.02em]
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}

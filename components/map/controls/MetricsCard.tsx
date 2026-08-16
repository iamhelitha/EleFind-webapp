"use client";

/**
 * Reusable stat/metric display card for sidebar panels.
 */

interface MetricsCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  subtitle?: string;
}

export default function MetricsCard({
  label,
  value,
  icon,
  subtitle,
}: MetricsCardProps) {
  return (
    <div className="rounded-lg border border-[rgba(32,30,29,0.14)] bg-sand-surface/50 p-3">
      <div className="flex items-center gap-2">
        {icon && <span className="text-accent-700">{icon}</span>}
        <span className="text-xs font-medium text-[rgba(32,30,29,0.55)]">{label}</span>
      </div>
      <p className="mt-1 text-lg font-bold text-ink tabular-nums">
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-[rgba(32,30,29,0.55)]">{subtitle}</p>
      )}
    </div>
  );
}

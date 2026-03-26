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
    <div className="rounded-lg border border-card-border bg-green-50/50 p-3">
      <div className="flex items-center gap-2">
        {icon && <span className="text-green-700">{icon}</span>}
        <span className="text-xs font-medium text-muted">{label}</span>
      </div>
      <p className="mt-1 text-lg font-bold text-green-900 tabular-nums">
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-muted">{subtitle}</p>
      )}
    </div>
  );
}

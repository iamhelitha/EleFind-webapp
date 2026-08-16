"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";

/**
 * Reusable button with variant styling.
 *
 * All buttons are pill-shaped (999px) per the design system's radius rule.
 * Labels are set in Figtree rather than the display face: the system's
 * first rule of thumb is "Caprasimo only above 20px", and button labels
 * live well below that.
 *
 * Variants:
 *  - `primary`   — terracotta fill; the action / detection colour
 *  - `secondary` — hairline outline on the sand ground
 *  - `ghost`     — text-only terracotta
 *  - `danger`    — clay; reserved for destructive actions
 *  - `night`     — outlined, for panels floating over the map ground
 */

type Variant = "primary" | "secondary" | "danger" | "ghost" | "night";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-accent text-sand hover:bg-accent-600 active:bg-accent-700 disabled:bg-accent/50",
  secondary:
    "border border-divider text-ink hover:bg-[rgba(32,30,29,0.07)] active:bg-[rgba(32,30,29,0.14)]",
  danger:
    "bg-clay-text text-sand hover:bg-clay-deep active:bg-clay-deep",
  ghost:
    "text-accent-700 hover:bg-[rgba(198,113,57,0.10)] active:bg-[rgba(198,113,57,0.18)]",
  night:
    "border border-[rgba(240,233,217,0.30)] text-night-text hover:bg-[rgba(240,233,217,0.10)]",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-4 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-[15px]",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading,
      children,
      className = "",
      disabled,
      ...rest
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center gap-2 rounded-full font-semibold
          transition-colors duration-150 cursor-pointer
          disabled:cursor-not-allowed disabled:opacity-45
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        {...rest}
      >
        {loading && (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;

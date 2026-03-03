"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";

/**
 * Reusable button with variant styling.
 *
 * Variants:
 *  - `primary`  — deep green background (CTA)
 *  - `secondary` — outlined green border
 *  - `danger`   — red tones for destructive actions
 *  - `ghost`    — transparent, subtle hover
 */

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-green-700 text-white hover:bg-green-900 active:bg-green-900 disabled:bg-green-700/50",
  secondary:
    "border-2 border-green-700 text-green-700 hover:bg-green-100 active:bg-green-300",
  danger:
    "bg-risk-high text-white hover:bg-risk-critical active:bg-risk-critical",
  ghost:
    "text-green-700 hover:bg-green-100 active:bg-green-300",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-base",
  lg: "px-7 py-3 text-lg",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, children, className = "", disabled, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center gap-2 rounded-xl font-medium
          transition-colors duration-150 cursor-pointer
          disabled:cursor-not-allowed disabled:opacity-60
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        {...rest}
      >
        {loading && (
          <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12" cy="12" r="10"
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

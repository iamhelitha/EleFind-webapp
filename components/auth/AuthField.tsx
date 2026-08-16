"use client";

import { forwardRef, type InputHTMLAttributes } from "react";

/**
 * Labelled pill-shaped text input used across the auth screens.
 *
 * Also exports `authInputClass` and `AuthError` so one-off inputs and
 * error banners elsewhere in the auth flow stay visually identical.
 */

export const authInputClass = `
  w-full min-h-[38px] rounded-full border border-divider bg-sand
  px-3.5 py-1.5 text-sm text-ink caret-accent
  transition-colors placeholder:text-[rgba(32,30,29,0.4)]
  hover:border-[rgba(32,30,29,0.45)]
  focus:border-accent focus:outline-none
  disabled:opacity-60
`;

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  /** Small hint rendered under the input. */
  hint?: React.ReactNode;
}

const AuthField = forwardRef<HTMLInputElement, AuthFieldProps>(
  ({ label, hint, id, className = "", ...rest }, ref) => {
    return (
      <div>
        <label
          htmlFor={id}
          className="mb-1.5 block text-xs text-[rgba(32,30,29,0.7)]"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={id}
          className={`${authInputClass} ${className}`}
          {...rest}
        />
        {hint && (
          <div className="mt-1.5 text-[11px] text-[rgba(32,30,29,0.55)]">
            {hint}
          </div>
        )}
      </div>
    );
  }
);

AuthField.displayName = "AuthField";
export default AuthField;

/** Clay-toned error banner. Clay is reserved for errors and CRITICAL. */
export function AuthError({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="alert"
      className="m-0 rounded-[22px] border border-clay-border bg-clay-surface px-4 py-3 text-[13px] leading-[1.5] text-clay-deep"
    >
      {children}
    </p>
  );
}

/** Sage-toned success / confirmation banner. */
export function AuthNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 rounded-[22px] bg-sage-100 px-4 py-3">
      <span className="mt-1.5 h-2 w-2 flex-none rounded-full bg-sage-600" />
      <p className="m-0 text-xs leading-[1.5] text-sage-900">{children}</p>
    </div>
  );
}

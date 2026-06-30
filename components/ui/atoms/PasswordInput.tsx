"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "./Input";

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  size?: 'sm' | 'md' | 'lg';
  hasError?: boolean;
  rightElement?: React.ReactNode;
}

/**
 * PasswordInput - Password input with show/hide toggle
 *
 * A password input component with a toggle button to show/hide the password.
 * This is a pure input component - use within FormField for label and error display.
 *
 * @example
 * <FormField label="Password" required>
 *   <PasswordInput
 *     value={password}
 *     onChange={(e) => setPassword(e.target.value)}
 *     size="md"
 *     hasError={hasError}
 *   />
 * </FormField>
 */
export function PasswordInput({
  size = "md",
  hasError = false,
  disabled = false,
  rightElement,
  className = "",
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  // Extra right padding for the toggle button (and optional rightElement)
  const pr = rightElement ? "!pr-28" : "!pr-10";

  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        size={size}
        hasError={hasError}
        disabled={disabled}
        className={`${pr} ${className}`}
        {...props}
      />
      <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {rightElement && (
          <div className="flex items-center">
            {rightElement}
          </div>
        )}
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          disabled={disabled}
          className="text-text-muted hover:text-text-secondary transition-colors cursor-pointer p-1 rounded-md hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

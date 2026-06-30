import React from "react";

interface HelperTextProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * HelperText - Helper text displayed below input fields
 *
 * Renders a small muted text for additional context or instructions.
 * Typically used within FormField to provide guidance.
 */
export function HelperText({ children, className = "" }: HelperTextProps) {
  return (
    <p className={`text-xs text-text-secondary mt-1.5 ${className}`}>
      {children}
    </p>
  );
}

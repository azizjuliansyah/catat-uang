import React from "react";
import { AlertCircle } from "lucide-react";

interface ErrorTextProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * ErrorText - Error message displayed below input fields
 *
 * Renders an error message with an icon for visual emphasis.
 * Typically used within FormField to display validation errors.
 */
export function ErrorText({ children, className = "" }: ErrorTextProps) {
  return (
    <p className={`text-xs text-danger font-medium mt-1.5 flex items-center gap-1.5 animate-fade-in ${className}`}>
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

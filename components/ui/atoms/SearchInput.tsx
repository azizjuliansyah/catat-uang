import React from "react";
import { Search, X } from "lucide-react";
import { Input } from "./Input";

interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  icon?: React.ComponentType<{ className?: string }>;
  placeholder?: string;
  size?: "sm" | "md" | "lg";
  onClear?: () => void;
  showClearButton?: boolean;
  containerClassName?: string;
  inputClassName?: string;
}

export function SearchInput({
  icon: Icon = Search,
  placeholder = "Cari...",
  size = "md",
  onClear,
  showClearButton = false,
  containerClassName = "",
  inputClassName = "",
  value,
  className,
  ...props
}: SearchInputProps) {
  const iconSizeClasses = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  // Extra left padding for icon, extra right padding for clear button
  const pl = "pl-10";
  const pr = showClearButton ? "pr-10" : "pr-3";

  const hasValue = typeof value === "string" && value.length > 0;

  return (
    <div className={`relative flex-1 sm:w-60 ${containerClassName}`}>
      <Icon
        className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary ${iconSizeClasses[size]}`}
      />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        className={`${pl} ${pr} ${showClearButton && hasValue ? "!pr-20" : ""} ${inputClassName} ${className}`}
        size={size}
        {...props}
      />
      {showClearButton && hasValue && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors p-1 rounded-md hover:bg-surface-hover"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

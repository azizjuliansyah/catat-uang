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
  const sizeClasses = {
    sm: "h-9 pl-9 pr-3 text-xs",
    md: "h-10 pl-9 pr-4 text-xs",
    lg: "h-11 pl-10 pr-4 text-sm",
  };

  const iconSizeClasses = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const hasValue = typeof value === "string" && value.length > 0;

  return (
    <div className={`relative flex-1 sm:w-60 ${containerClassName}`}>
      <Icon
        className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary ${iconSizeClasses[size]}`}
      />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        className={`${sizeClasses[size]} w-full bg-surface-input border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-text-primary outline-none transition-all focus-glow ${showClearButton && hasValue ? "pr-20" : ""} ${inputClassName} ${className}`}
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

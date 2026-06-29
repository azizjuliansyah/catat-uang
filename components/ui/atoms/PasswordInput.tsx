"use client";

import { useState } from "react";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "./Button";

interface PasswordInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function PasswordInput({
  label,
  placeholder = "Masukkan password",
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  className = "",
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
          {label}
          {required && <span className="text-danger">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-3.5 py-2.5 pr-12 bg-surface-input border rounded-xl text-xs text-text-primary outline-none transition-all focus-glow ${
            error
              ? "border-danger focus:border-danger focus:ring-1 focus:ring-danger"
              : "border-border focus:border-primary focus:ring-1 focus:ring-primary"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowPassword(!showPassword)}
          disabled={disabled}
          className="absolute right-1 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors cursor-pointer min-h-0 h-10 w-10 p-0 bg-transparent border-transparent hover:bg-transparent"
        >
          {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
        </Button>
      </div>
      {error && (
        <p className="text-xs text-danger font-medium flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}

import React, { ReactNode } from "react";

export type InfoCardVariant =
  | "primary"
  | "success"
  | "danger"
  | "warning"
  | "info"
  | "neutral"
  | "income"
  | "expense"
  | "transfer"
  | "owe"
  | "lend";

interface InfoCardProps {
  title: string;
  value: ReactNode;
  variant?: InfoCardVariant;
  className?: string;
  valueClassName?: string;
  description?: string;
  onClick?: () => void;
  isLoading?: boolean;
}

export function InfoCard({
  title,
  value,
  variant = "neutral",
  className = "",
  valueClassName = "",
  description,
  onClick,
  isLoading = false,
}: InfoCardProps) {
  // Value text colors
  const valueColors: Record<InfoCardVariant, string> = {
    primary: "text-primary",
    success: "text-success",
    danger: "text-danger",
    warning: "text-warning",
    info: "text-info",
    neutral: "text-text-primary",
    income: "text-income",
    expense: "text-expense",
    transfer: "text-transfer",
    owe: "text-debt-owe",
    lend: "text-debt-lend",
  };

  const valueColorClass = valueColors[variant] || valueColors.neutral;

  return (
    <div
      onClick={onClick}
      className={`bg-surface-card border border-border rounded-2xl p-5 transition-all ${
        onClick ? "cursor-pointer active:scale-[0.98]" : ""
      } ${className}`}
    >
      <p className="text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">
        {title}
      </p>
      {isLoading ? (
        <div className="h-7 mt-2 bg-border/40 rounded animate-pulse w-32" aria-hidden="true" />
      ) : (
        <p className={`text-2xl font-bold mt-2 font-mono ${valueColorClass} ${valueClassName}`}>
          {value}
        </p>
      )}
      {description && (
        <p className="text-[10px] text-text-secondary mt-1">{description}</p>
      )}
    </div>
  );
}

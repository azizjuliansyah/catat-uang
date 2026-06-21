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
  icon?: ReactNode;
  variant?: InfoCardVariant;
  className?: string;
  valueClassName?: string;
  onClick?: () => void;
  isLoading?: boolean;
}

export function InfoCard({
  title,
  value,
  icon,
  variant = "neutral",
  className = "",
  valueClassName = "",
  onClick,
  isLoading = false,
}: InfoCardProps) {
  // Border gradients using the custom colors from globals.css
  const borderGradients: Record<InfoCardVariant, string> = {
    primary: "from-primary/30 via-primary/10 to-transparent hover:from-primary/60 hover:via-primary/25",
    success: "from-success/30 via-success/10 to-transparent hover:from-success/60 hover:via-success/25",
    danger: "from-danger/30 via-danger/10 to-transparent hover:from-danger/60 hover:via-danger/25",
    warning: "from-warning/30 via-warning/10 to-transparent hover:from-warning/60 hover:via-warning/25",
    info: "from-info/30 via-info/10 to-transparent hover:from-info/60 hover:via-info/25",
    neutral: "from-border-strong/30 via-border/10 to-transparent hover:from-border-strong/60 hover:via-border-strong/25",
    income: "from-income/30 via-income/10 to-transparent hover:from-income/60 hover:via-income/25",
    expense: "from-expense/30 via-expense/10 to-transparent hover:from-expense/60 hover:via-expense/25",
    transfer: "from-transfer/30 via-transfer/10 to-transparent hover:from-transfer/60 hover:via-transfer/25",
    owe: "from-debt-owe/30 via-debt-owe/10 to-transparent hover:from-debt-owe/60 hover:via-debt-owe/25",
    lend: "from-debt-lend/30 via-debt-lend/10 to-transparent hover:from-debt-lend/60 hover:via-debt-lend/25",
  };

  // Interior glows
  const bgGlows: Record<InfoCardVariant, string> = {
    primary: "bg-primary",
    success: "bg-success",
    danger: "bg-danger",
    warning: "bg-warning",
    info: "bg-info",
    neutral: "bg-border-strong",
    income: "bg-income",
    expense: "bg-expense",
    transfer: "bg-transfer",
    owe: "bg-debt-owe",
    lend: "bg-debt-lend",
  };

  // Icon styles
  const iconStyles: Record<InfoCardVariant, string> = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    danger: "bg-danger/10 text-danger",
    warning: "bg-warning/10 text-warning",
    info: "bg-info/10 text-info",
    neutral: "bg-border-strong/20 text-text-primary",
    income: "bg-income/10 text-income",
    expense: "bg-expense/10 text-expense",
    transfer: "bg-transfer/10 text-transfer",
    owe: "bg-debt-owe/10 text-debt-owe",
    lend: "bg-debt-lend/10 text-debt-lend",
  };

  if (isLoading) {
    return (
      <div className="p-[1.5px] rounded-lg bg-border/45 w-full">
        <div className="bg-surface-card rounded-md p-5 flex items-center gap-4 relative overflow-hidden">
          <div className="w-10 h-10 rounded-md bg-surface-hover animate-pulse shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="h-3 w-16 bg-surface-hover rounded animate-pulse" />
            <div className="h-5 w-28 bg-surface-hover rounded animate-pulse mt-2" />
          </div>
        </div>
      </div>
    );
  }

  const borderGradientClass = borderGradients[variant];
  const bgGlowClass = bgGlows[variant];
  const iconStyleClass = iconStyles[variant];

  return (
    <div
      onClick={onClick}
      className={`p-[1.5px] rounded-lg bg-gradient-to-br transition-all duration-150 ease ${borderGradientClass} ${
        onClick ? "cursor-pointer active:scale-[0.98]" : ""
      } ${className}`}
    >
      <div className="bg-surface-card w-full h-full rounded-md p-5 flex items-center gap-4 relative overflow-hidden group">
        {/* Icon wrapper */}
        {icon && (
          <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-md flex items-center justify-center shrink-0 ${iconStyleClass}`}>
            {icon}
          </div>
        )}

        {/* Text content */}
        <div className="min-w-0 flex-1">
          <p className="text-xxs font-bold text-text-secondary uppercase tracking-wider truncate">
            {title}
          </p>
          <div className={`text-lg font-bold font-mono text-text-primary mt-1 truncate ${valueClassName}`}>
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}

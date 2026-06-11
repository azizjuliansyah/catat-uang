import React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "primary"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "income"
    | "expense"
    | "transfer"
    | "neutral";
}

export function Badge({ variant = "neutral", children, className = "", ...props }: BadgeProps) {
  const baseClasses =
    "inline-flex items-center px-2 py-0.5 rounded-full text-xxs font-semibold font-sans tracking-wider uppercase select-none border";

  const variantClasses = {
    primary: "bg-primary/10 text-primary border-primary/20",
    success: "bg-success/10 text-success border-success/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    danger: "bg-danger/10 text-danger border-danger/20",
    info: "bg-info/10 text-info border-info/20",
    income: "bg-income/10 text-income border-income/20",
    expense: "bg-expense/10 text-expense border-expense/20",
    transfer: "bg-transfer/10 text-transfer border-transfer/20",
    neutral: "bg-surface-hover/50 text-text-secondary border-border",
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
}

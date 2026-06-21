import React from "react";

export type Status =
  | "paid"
  | "unpaid"
  | "partial"
  | "overdue"
  | "achieved"
  | "withdrawn"
  | "ongoing"
  | "late"
  | "income"
  | "expense";

interface StatusBadgeProps {
  status: Status;
  size?: "sm" | "md";
  className?: string;
}

export function StatusBadge({
  status,
  size = "md",
  className = "",
}: StatusBadgeProps) {
  const sizeClasses = {
    sm: "px-1.5 py-0.5 text-[10px]",
    md: "px-2 py-1 text-xs",
  };

  const statusConfig: Record<
    Status,
    { bg: string; color: string; border: string; label: string }
  > = {
    paid: {
      bg: "bg-success/10",
      color: "text-success",
      border: "border-success/20",
      label: "Lunas",
    },
    unpaid: {
      bg: "bg-warning/10",
      color: "text-warning",
      border: "border-warning/20",
      label: "Belum Bayar",
    },
    partial: {
      bg: "bg-info/10",
      color: "text-info",
      border: "border-info/20",
      label: "Sebagian",
    },
    overdue: {
      bg: "bg-danger/10",
      color: "text-danger",
      border: "border-danger/20",
      label: "Terlambat",
    },
    achieved: {
      bg: "bg-success/10",
      color: "text-success",
      border: "border-success/20",
      label: "Tercapai",
    },
    withdrawn: {
      bg: "bg-text-muted/10",
      color: "text-text-muted",
      border: "border-text-muted/20",
      label: "Ditarik",
    },
    ongoing: {
      bg: "bg-primary/10",
      color: "text-primary",
      border: "border-primary/20",
      label: "Berjalan",
    },
    late: {
      bg: "bg-danger/10",
      color: "text-danger",
      border: "border-danger/20",
      label: "Terlambat",
    },
    income: {
      bg: "bg-income/10",
      color: "text-income",
      border: "border-income/20",
      label: "Pemasukan",
    },
    expense: {
      bg: "bg-expense/10",
      color: "text-expense",
      border: "border-expense/20",
      label: "Pengeluaran",
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={`inline-block rounded-md font-semibold uppercase tracking-wide border transition-all duration-150 ${sizeClasses[size]} ${config.bg} ${config.color} ${config.border} ${className}`}
    >
      {config.label}
    </span>
  );
}

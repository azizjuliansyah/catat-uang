"use client";

import React from "react";
import { Calendar, LucideIcon } from "lucide-react";
import { formatDateTimeShort, formatDateTimeLong } from "@/lib/utils/date";

export type DateFormat = "short" | "long" | "relative";

interface DateDisplayProps {
  date: string | Date;
  format?: DateFormat;
  showIcon?: boolean;
  icon?: LucideIcon;
  label?: string;
  iconClassName?: string;
  valueClassName?: string;
  className?: string;
}

/**
 * Date display component with optional icon and label.
 *
 * @example
 * <DateDisplay date={goal.target_date} label="Target:" showIcon />
 * <DateDisplay date={transaction.date} format="long" />
 */
export function DateDisplay({
  date,
  format = "short",
  showIcon = false,
  icon: Icon = Calendar,
  label,
  iconClassName = "",
  valueClassName = "",
  className = "",
}: DateDisplayProps) {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const dateStr = typeof date === "string" ? date : date.toISOString();

  let formattedDate: string;
  switch (format) {
    case "long":
      formattedDate = formatDateTimeLong(dateStr);
      break;
    case "short":
    default:
      formattedDate = formatDateTimeShort(dateStr);
      break;
  }

  return (
    <div className={`flex items-center gap-1.5 text-xs text-text-secondary ${className}`}>
      {showIcon && <Icon className={`w-4 h-4 text-text-secondary shrink-0 ${iconClassName}`} />}
      {label && (
        <span className="text-[10px] font-semibold">
          {label}{" "}
        </span>
      )}
      <span className={`font-bold text-text-primary font-mono ${valueClassName}`}>
        {formattedDate}
      </span>
    </div>
  );
}

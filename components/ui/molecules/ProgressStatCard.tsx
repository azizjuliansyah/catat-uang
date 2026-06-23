"use client";

import React, { ReactNode } from "react";
import { InfoCard, InfoCardVariant } from "./InfoCard";
import { ProgressBar } from "@/components/ui/atoms/ProgressBar";

export interface ProgressStatCardProps {
  title: string;
  value: ReactNode;
  variant?: InfoCardVariant;
  description?: string;
  className?: string;
  valueClassName?: string;
  onClick?: () => void;
  isLoading?: boolean;

  // Progress-related props
  progress?: {
    value: number; // 0-100
    label?: string;
    showPercentage?: boolean;
    showLabel?: boolean;
    color?: string; // Override default variant color
  };
}

/**
 * InfoCard with optional progress bar.
 *
 * @example
 * <ProgressStatCard
 *   title="Total Pinjaman"
 *   value={formatIDR(debt.total_amount)}
 *   variant="danger"
 *   progress={{
 *     value: paidPercentage,
 *     label: "Dibayar",
 *     showPercentage: true
 *   }}
 * />
 */
export function ProgressStatCard({
  progress,
  ...infoCardProps
}: ProgressStatCardProps) {
  return (
    <InfoCard {...infoCardProps}>
      {progress && (
        <ProgressBar
          value={progress.value}
          label={progress.label}
          showPercentage={progress.showPercentage}
          showLabel={progress.showLabel}
          color={progress.color}
          className="mt-3"
        />
      )}
    </InfoCard>
  );
}

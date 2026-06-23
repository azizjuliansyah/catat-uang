"use client";

import { InfoCard } from "@/components/ui/molecules/InfoCard";
import { PaylaterBannerSkeleton } from "./PaylaterSkeleton";
import { formatIDR } from "@/lib/utils/format";

interface PaylaterSummaryCardsProps {
  loading: boolean;
  totalUsed: number;
  totalAvailable: number;
  totalLimit: number;
  overallUsagePercentage: number;
  hasPlatforms: boolean;
}

export function PaylaterSummaryCards({
  loading,
  totalUsed,
  totalAvailable,
  totalLimit,
  overallUsagePercentage,
  hasPlatforms,
}: PaylaterSummaryCardsProps) {
  if (loading) {
    return <PaylaterBannerSkeleton />;
  }

  if (!hasPlatforms) {
    return null;
  }

  return (
    <>
      {/* Progress Bar Card */}
      <div className="bg-surface-card rounded-2xl p-5 space-y-3" style={{ border: '1px solid var(--color-border-default)' }}>
        <div className="flex items-center justify-between">
          <p className="text-xs font-extrabold text-text-secondary uppercase tracking-wider">Persentase Penggunaan Limit</p>
          <span className="text-sm font-bold text-text-primary tabular-nums">{overallUsagePercentage.toFixed(1)}%</span>
        </div>
        <div className="w-full h-3 bg-surface-hover/60 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-feedback-error transition-all duration-500"
            style={{ width: `${overallUsagePercentage}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-text-secondary font-mono">
          <span>Terpakai: {formatIDR(totalUsed)}</span>
          <span>Limit: {formatIDR(totalLimit)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Tagihan */}
        <InfoCard
          title="Total Tagihan"
          value={formatIDR(totalUsed)}
          variant="danger"
          description="Akumulasi penggunaan limit"
        />

        {/* Sisa Kredit Tersedia */}
        <InfoCard
          title="Sisa Kredit Tersedia"
          value={formatIDR(totalAvailable)}
          variant="success"
          description="Limit yang masih bisa digunakan"
        />

        {/* Total Batas Limit */}
        <InfoCard
          title="Total Batas Limit"
          value={formatIDR(totalLimit)}
          variant="neutral"
          description="Gabungan dari seluruh platform"
        />
      </div>
    </>
  );
}

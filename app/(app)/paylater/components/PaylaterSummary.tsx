"use client";

import { InfoCard } from "@/components/ui/molecules/InfoCard";
import { ProgressBar } from "@/components/ui/molecules/ProgressBar";
import { formatIDR } from "@/lib/utils/format";

interface PaylaterSummaryProps {
  loading: boolean;
  totalUsed: number;
  totalAvailable: number;
  totalLimit: number;
  overallUsagePercentage: number;
  hasPlatforms: boolean;
  platformCount: number;
}

export function PaylaterSummary({
  loading,
  totalUsed,
  totalAvailable,
  totalLimit,
  overallUsagePercentage,
  hasPlatforms,
  platformCount,
}: PaylaterSummaryProps) {
  // Summary cards are always shown, even when empty
  return (
    <>
      {/* Progress Bar Card */}
      <div
        className="bg-surface-card rounded-2xl p-5 space-y-3"
        style={{ border: "1px solid var(--color-border-default)" }}
      >
        <div className="flex items-center justify-between">
          <p className="text-xs font-extrabold text-text-secondary uppercase tracking-wider">
            Persentase Penggunaan Limit
          </p>
          {loading ? (
            <div className="h-5 w-16 bg-border/40 rounded animate-pulse" />
          ) : (
            <span className="text-sm font-bold text-text-primary tabular-nums">
              {overallUsagePercentage.toFixed(1)}%
            </span>
          )}
        </div>
        <ProgressBar
          percentage={overallUsagePercentage}
          variant="gradient"
          height="md"
          trackColor="muted"
          isLoading={loading}
        />
        <div className="flex justify-between text-[10px] text-text-secondary font-mono">
          {loading ? (
            <>
              <div className="h-4 w-24 bg-border/40 rounded animate-pulse" />
              <div className="h-4 w-24 bg-border/40 rounded animate-pulse" />
            </>
          ) : (
            <>
              <span>Terpakai: {formatIDR(totalUsed)}</span>
              <span>Limit: {formatIDR(totalLimit)}</span>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tagihan */}
        <InfoCard
          title="Total Tagihan"
          value={formatIDR(totalUsed)}
          variant="expense"
          description="Akumulasi penggunaan limit"
          isLoading={loading}
        />

        {/* Sisa Kredit Tersedia */}
        <InfoCard
          title="Sisa Kredit Tersedia"
          value={formatIDR(totalAvailable)}
          variant="success"
          description="Limit yang masih bisa digunakan"
          isLoading={loading}
        />

        {/* Jumlah Platform */}
        <InfoCard
          title="Jumlah Platform"
          value={loading ? "-" : platformCount.toString()}
          variant="primary"
          description={
            loading
              ? "Loading..."
              : `${platformCount} platform aktif`
          }
          isLoading={loading}
        />

        {/* Total Batas Limit */}
        <InfoCard
          title="Total Batas Limit"
          value={formatIDR(totalLimit)}
          variant="neutral"
          description="Gabungan dari seluruh platform"
          isLoading={loading}
        />
      </div>
    </>
  );
}

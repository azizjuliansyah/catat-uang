/**
 * PayLater Detail Summary Component
 * Displays remaining balance, limit, and progress bar (renamed from PaylaterProgressStats)
 */

import { PaylaterPlatform, PaylaterBillingDates } from "../../types";
import { ProgressBar } from "@/components/ui/molecules/ProgressBar";
import { InfoCard } from "@/components/ui/molecules/InfoCard";
import { formatIDR } from "@/lib/utils/format";

interface PaylaterDetailSummaryProps {
  platform: PaylaterPlatform | null;
  nextDates: PaylaterBillingDates | null;
  isLoading?: boolean;
}

export function PaylaterDetailSummary({ platform, nextDates, isLoading = false }: PaylaterDetailSummaryProps) {
  const isPlatformLoading = isLoading || !platform;

  const remainingLimit = platform ? platform.limit_amount - platform.balance : 0;
  const usagePercentage = platform
    ? platform.limit_amount > 0
      ? Math.min((platform.balance / platform.limit_amount) * 100, 100)
      : 0
    : 0;

  // Dynamic description for Sisa Tagihan card
  const sisaTagihanDesc = nextDates?.due ? `Jatuh tempo: ${nextDates.due}` : undefined;

  return (
    <>
      {/* Info Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Sisa Tagihan */}
        <InfoCard
          title="Sisa Tagihan"
          variant={"expense"}
          value={isPlatformLoading ? null : formatIDR(platform.balance)}
          description={sisaTagihanDesc}
          isLoading={isPlatformLoading}
          className="col-span-2"
        />

        {/* Total Limit */}
        <InfoCard
          title="Total Limit"
          value={isPlatformLoading ? null : formatIDR(platform.limit_amount)}
          isLoading={isPlatformLoading}
          description="Total Limit yang bisa digunakan"
          valueClassName="text-xl"
        />

        {/* Sisa Limit */}
        <InfoCard
          title="Sisa Limit"
          value={isPlatformLoading ? null : formatIDR(remainingLimit)}
          variant="success"
          isLoading={isPlatformLoading}
          description="Limit yang masih bisa digunakan"
          valueClassName="text-xl"
        />
      </div>

      {/* Progress Bar Card */}
      <div
        className="bg-surface-card rounded-2xl p-5 space-y-3"
        style={{ border: "1px solid var(--color-border-default)" }}
      >
        <div className="flex items-center justify-between">
          <p className="text-xs font-extrabold text-text-secondary uppercase tracking-wider">
            Penggunaan Limit
          </p>
          {isPlatformLoading ? (
            <div className="h-4 w-10 bg-border/40 rounded animate-pulse" />
          ) : (
            <span
              className="text-sm font-bold tabular-nums"
              style={{
                color:
                  platform.balance > platform.limit_amount
                    ? "#EF4444"
                    : platform.color,
              }}
            >
              {usagePercentage.toFixed(1)}%
            </span>
          )}
        </div>
        <ProgressBar
          percentage={usagePercentage}
          variant="gradient"
          color={!isPlatformLoading ? platform.color : undefined}
          height="md"
          trackColor="muted"
          isLoading={isPlatformLoading}
        />
        <div className="flex justify-between text-[10px] text-text-secondary font-mono">
          {isPlatformLoading ? (
            <>
              <div className="h-2.5 w-20 bg-border/40 rounded animate-pulse" />
              <div className="h-2.5 w-16 bg-border/40 rounded animate-pulse" />
            </>
          ) : (
            <>
              <span>Terpakai: {formatIDR(platform.balance)}</span>
              <span>Limit: {formatIDR(platform.limit_amount)}</span>
            </>
          )}
        </div>
      </div>
    </>
  );
}

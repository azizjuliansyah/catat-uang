/**
 * PayLater Progress Stats Component
 * Displays remaining balance, limit, and progress bar
 */

import { PaylaterPlatform, PaylaterBillingDates } from "../../types";
import { Calendar } from "lucide-react";
import { formatIDR } from "@/lib/utils/format";

interface PaylaterProgressStatsProps {
  platform: PaylaterPlatform;
  nextDates: PaylaterBillingDates;
}

export function PaylaterProgressStats({ platform, nextDates }: PaylaterProgressStatsProps) {
  const remainingLimit = platform.limit_amount - platform.balance;
  const usagePercentage = platform.limit_amount > 0
    ? Math.min((platform.balance / platform.limit_amount) * 100, 100)
    : 0;

  return (
    <>
      {/* Info Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Sisa Tagihan — spans 2 cols */}
        <div className="col-span-2 bg-surface-card border border-border rounded-2xl p-5 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{ backgroundColor: platform.color }}
          />
          <p className="text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">Sisa Tagihan</p>
          <p className="text-2xl font-extrabold text-text-primary mt-2 font-mono">
            {formatIDR(platform.balance)}
          </p>
          <p className="text-[10px] text-text-secondary mt-1.5 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Jatuh tempo: {nextDates.due}
          </p>
        </div>

        {/* Total Limit */}
        <div className="bg-surface-card border border-border rounded-2xl p-5">
          <p className="text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">Total Limit</p>
          <p className="text-xl font-bold text-text-primary mt-2 font-mono">{formatIDR(platform.limit_amount)}</p>
        </div>

        {/* Sisa Limit */}
        <div className="bg-surface-card border border-border rounded-2xl p-5">
          <p className="text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">Sisa Limit</p>
          <p className="text-xl font-bold text-success mt-2 font-mono">{formatIDR(remainingLimit)}</p>
        </div>
      </div>

      {/* Progress Bar Card */}
      <div className="bg-surface-card rounded-2xl p-5 space-y-3" style={{ border: '1px solid var(--color-border-default)' }}>
        <div className="flex items-center justify-between">
          <p className="text-xs font-extrabold text-text-secondary uppercase tracking-wider">Penggunaan Limit</p>
          <span
            className="text-sm font-bold tabular-nums"
            style={{ color: platform.balance > platform.limit_amount ? "#EF4444" : platform.color }}
          >
            {usagePercentage.toFixed(1)}%
          </span>
        </div>
        <div className="w-full h-3 bg-surface-hover/60 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${Math.min(usagePercentage, 100)}%`,
              backgroundColor: platform.balance > platform.limit_amount ? "#EF4444" : platform.color
            }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-text-secondary font-mono">
          <span>Terpakai: {formatIDR(platform.balance)}</span>
          <span>Limit: {formatIDR(platform.limit_amount)}</span>
        </div>
      </div>
    </>
  );
}

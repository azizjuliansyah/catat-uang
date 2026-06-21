/**
 * Debt Progress Stats Component
 * Displays debt statistics and progress bar
 */

import { DebtItem } from "../types";
import { formatIDR } from "../../utils";
import { Coins, CheckCircle2 } from "lucide-react";

interface DebtProgressStatsProps {
  debt: DebtItem;
}

export function DebtProgressStats({ debt }: DebtProgressStatsProps) {
  const remaining = debt.total_amount - debt.paid_amount;
  const progress = debt.total_amount > 0 ? (debt.paid_amount / debt.total_amount) * 100 : 0;
  const isOwe = debt.type === "owe";

  return (
    <>
      {/* Grid statistics summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total amount */}
        <div className="bg-surface-card border border-border p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <p className="text-xxs font-extrabold text-text-secondary uppercase tracking-wider flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-text-secondary" />
              Total Pinjaman
            </p>
            <p className="text-xl font-bold text-text-primary mt-2 font-mono">
              {formatIDR(debt.total_amount)}
            </p>
          </div>
        </div>

        {/* Paid amount */}
        <div className="bg-surface-card border border-border p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <p className="text-xxs font-extrabold text-text-secondary uppercase tracking-wider flex items-center gap-1 text-success">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Total Terbayar
            </p>
            <p className="text-xl font-bold text-text-primary mt-2 font-mono">
              {formatIDR(debt.paid_amount)}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-surface-card border border-border p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <p className="text-xxs font-extrabold text-text-secondary uppercase tracking-wider">Progres Pelunasan</p>
            <div className="w-full h-2 bg-surface-input rounded-full overflow-hidden mt-4">
              <div
                className={`h-full rounded-full transition-all duration-500 ${debt.status === "paid" ? "bg-success" : isOwe ? "bg-amber-500" : "bg-cyan-500"}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-text-secondary mt-1.5 font-mono">
              <span>{progress.toFixed(1)}% Terbayar</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

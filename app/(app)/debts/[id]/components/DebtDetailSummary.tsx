/**
 * Debt Detail Summary Component
 * Displays debt statistics and progress bar (renamed from DebtProgressStats)
 */

import { DebtItem } from "../types";
import { formatIDR } from "../../utils";
import { InfoCard } from "@/components/ui/molecules/InfoCard";

interface DebtDetailSummaryProps {
  debt: DebtItem | null;
  isLoading?: boolean;
}

export function DebtDetailSummary({ debt, isLoading = false }: DebtDetailSummaryProps) {
  const remaining = debt ? debt.total_amount - debt.paid_amount : 0;
  const progress = debt && debt.total_amount > 0 ? (debt.paid_amount / debt.total_amount) * 100 : 0;
  const isOwe = debt?.type === "owe";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Total amount */}
      <InfoCard
        title="Total Pinjaman"
        value={debt ? formatIDR(debt.total_amount) : "-"}
        variant={isOwe ? "owe" : "lend"}
        description={isOwe ? "Jumlah hutang kepada pihak lain" : "Jumlah dipinjamkan ke pihak lain"}
        isLoading={isLoading}
      />

      {/* Paid amount */}
      <InfoCard
        title="Total Terbayar"
        value={debt ? formatIDR(debt.paid_amount) : "-"}
        variant="success"
        description="Jumlah yang sudah dibayarkan/diterima kembali"
        isLoading={isLoading}
      />

      {/* Progress Bar - custom card for progress visualization */}
      <div className="bg-surface-card border border-border rounded-2xl p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">
            Progres Pelunasan
          </p>
          {debt && (
            <p className="text-[10px] text-text-muted">
              {debt.status === "paid" ? "Sudah lunas" : `Sisa: ${formatIDR(remaining)}`}
            </p>
          )}
        </div>
        {isLoading ? (
          <div className="h-7 w-32 bg-border/40 rounded animate-pulse mt-2" />
        ) : (
          <>
            <div className="w-full h-2 bg-surface-input rounded-full overflow-hidden mt-4">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  debt?.status === "paid"
                    ? "bg-success"
                    : isOwe
                      ? "bg-[#d48c3a]"
                      : "bg-[#5c6bc0]"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-text-secondary mt-1.5 font-mono">
              <span>{progress.toFixed(1)}% Terbayar</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

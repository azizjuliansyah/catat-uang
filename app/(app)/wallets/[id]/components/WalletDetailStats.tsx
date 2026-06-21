import { TrendingUp, TrendingDown, ArrowRightLeft } from "lucide-react";
import { formatIDR } from "@/lib/utils/format";

interface WalletDetailStatsProps {
  totalIncome: number;
  totalExpense: number;
  netFlow: number;
}

export function WalletDetailStats({
  totalIncome,
  totalExpense,
  netFlow
}: WalletDetailStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-surface-card border border-border p-5 rounded-2xl">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-success" />
          <p className="text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">
            Total Pemasukan
          </p>
        </div>
        <p className="text-xl font-bold text-success font-mono">{formatIDR(totalIncome)}</p>
      </div>

      <div className="bg-surface-card border border-border p-5 rounded-2xl">
        <div className="flex items-center gap-2 mb-2">
          <TrendingDown className="w-4 h-4 text-danger" />
          <p className="text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">
            Total Pengeluaran
          </p>
        </div>
        <p className="text-xl font-bold text-danger font-mono">{formatIDR(totalExpense)}</p>
      </div>

      <div className="bg-surface-card border border-border p-5 rounded-2xl">
        <div className="flex items-center gap-2 mb-2">
          <ArrowRightLeft className="w-4 h-4 text-text-muted" />
          <p className="text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">
            Aliran Bersih
          </p>
        </div>
        <p
          className={`text-xl font-bold font-mono ${
            netFlow >= 0 ? "text-success" : "text-danger"
          }`}
        >
          {netFlow >= 0 ? "+" : ""}
          {formatIDR(Math.abs(netFlow))}
        </p>
      </div>
    </div>
  );
}

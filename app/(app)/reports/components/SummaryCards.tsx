import { InfoCard } from "@/components/ui/molecules/InfoCard";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

interface SummaryCardsProps {
  totalIncome: number;
  totalExpense: number;
  netCashflow: number;
  currentWalletsTotal: number;
  formatIDR: (val: number) => string;
}

export function SummaryCards({
  totalIncome,
  totalExpense,
  netCashflow,
  currentWalletsTotal,
  formatIDR
}: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <InfoCard
        title="Total Pemasukan"
        value={formatIDR(totalIncome)}
        icon={<TrendingUp className="w-5 h-5" />}
        variant="income"
        valueClassName="text-income"
      />

      <InfoCard
        title="Total Pengeluaran"
        value={formatIDR(totalExpense)}
        icon={<TrendingDown className="w-5 h-5" />}
        variant="expense"
        valueClassName="text-expense"
      />

      <InfoCard
        title="Arus Kas Bersih"
        value={formatIDR(netCashflow)}
        icon={netCashflow >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
        variant={netCashflow >= 0 ? "success" : "danger"}
        valueClassName={netCashflow >= 0 ? "text-success" : "text-danger"}
      />

      <InfoCard
        title="Total Saldo Dompet"
        value={formatIDR(currentWalletsTotal)}
        icon={<Wallet className="w-5 h-5" />}
        variant="primary"
      />
    </div>
  );
}


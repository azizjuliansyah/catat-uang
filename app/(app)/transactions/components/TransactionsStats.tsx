import { InfoCard } from "@/components/ui/molecules/InfoCard";
import { TrendingUp, TrendingDown, ArrowRightLeft } from "lucide-react";

interface TransactionsStatsProps {
  totalIncome: number;
  totalExpense: number;
  netFlow: number;
  formatIDR: (val: number) => string;
}

export function TransactionsStats({
  totalIncome,
  totalExpense,
  netFlow,
  formatIDR
}: TransactionsStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Income Card */}
      <InfoCard
        title="Total Pemasukan"
        value={formatIDR(totalIncome)}
        icon={<TrendingUp className="w-5 h-5" />}
        variant="income"
        valueClassName="text-income"
      />

      {/* Expense Card */}
      <InfoCard
        title="Total Pengeluaran"
        value={formatIDR(totalExpense)}
        icon={<TrendingDown className="w-5 h-5" />}
        variant="expense"
        valueClassName="text-expense"
      />

      {/* Net Flow Card */}
      <InfoCard
        title="Arus Bersih (Net)"
        value={formatIDR(netFlow)}
        icon={<ArrowRightLeft className="w-5 h-5" />}
        variant={netFlow >= 0 ? "success" : "danger"}
        valueClassName={netFlow >= 0 ? "text-success" : "text-danger"}
      />
    </div>
  );
}


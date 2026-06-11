import { InfoCard } from "@/components/ui/molecules/InfoCard";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

interface DashboardStatsProps {
  totalBalance: number;
  currentMonthIncome: number;
  currentMonthExpense: number;
  netCashflow: number;
}

export function DashboardStats({
  totalBalance,
  currentMonthIncome,
  currentMonthExpense,
  netCashflow
}: DashboardStatsProps) {
  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
      {/* Total Balance */}
      <InfoCard
        title="Total Saldo"
        value={formatIDR(totalBalance)}
        icon={<Wallet className="w-5 h-5" />}
        variant="primary"
      />

      {/* Current Month Income */}
      <InfoCard
        title="Pemasukan Bulan Ini"
        value={formatIDR(currentMonthIncome)}
        icon={<TrendingUp className="w-5 h-5" />}
        variant="income"
        valueClassName="text-income"
      />

      {/* Current Month Expense */}
      <InfoCard
        title="Pengeluaran Bulan Ini"
        value={formatIDR(currentMonthExpense)}
        icon={<TrendingDown className="w-5 h-5" />}
        variant="expense"
        valueClassName="text-expense"
      />

      {/* Net Flow */}
      <InfoCard
        title="Arus Bersih (Net)"
        value={formatIDR(netCashflow)}
        icon={netCashflow >= 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
        variant={netCashflow >= 0 ? "success" : "danger"}
        valueClassName={netCashflow >= 0 ? "text-success" : "text-danger"}
      />
    </div>
  );
}


import { InfoCard } from "@/components/ui/molecules/InfoCard";

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
        variant="income"
        description="Semua transaksi masuk"
      />

      {/* Expense Card */}
      <InfoCard
        title="Total Pengeluaran"
        value={formatIDR(totalExpense)}
        variant="expense"
        description="Semua transaksi keluar"
      />

      {/* Net Flow Card */}
      <InfoCard
        title="Arus Bersih (Net)"
        value={formatIDR(netFlow)}
        variant={netFlow >= 0 ? "success" : "danger"}
        description={netFlow >= 0 ? "Surplus transaksi" : "Defisit transaksi"}
      />
    </div>
  );
}

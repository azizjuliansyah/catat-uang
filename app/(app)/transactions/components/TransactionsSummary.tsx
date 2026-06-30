import { InfoCard } from "@/components/ui/molecules/InfoCard";

interface TransactionsSummaryProps {
  totalIncome: number;
  totalExpense: number;
  netFlow: number;
  formatIDR: (val: number) => string;
  isLoading?: boolean;
}

export function TransactionsSummary({
  totalIncome,
  totalExpense,
  netFlow,
  formatIDR,
  isLoading = false,
}: TransactionsSummaryProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Income Card */}
      <InfoCard
        title="Total Pemasukan"
        value={formatIDR(totalIncome)}
        variant="income"
        description="Semua transaksi masuk"
        isLoading={isLoading}
      />

      {/* Expense Card */}
      <InfoCard
        title="Total Pengeluaran"
        value={formatIDR(totalExpense)}
        variant="expense"
        description="Semua transaksi keluar"
        isLoading={isLoading}
      />

      {/* Net Flow Card */}
      <InfoCard
        title="Arus Bersih (Net)"
        value={formatIDR(netFlow)}
        variant={netFlow >= 0 ? "income" : "expense"}
        description={netFlow >= 0 ? "Surplus transaksi" : "Defisit transaksi"}
        isLoading={isLoading}
      />
    </div>
  );
}

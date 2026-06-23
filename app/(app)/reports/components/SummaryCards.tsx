import { InfoCard } from "@/components/ui/molecules/InfoCard";
import { formatIDR } from "@/lib/utils/format";

interface SummaryCardsProps {
  totalIncome: number;
  totalExpense: number;
  netCashflow: number;
  currentWalletsTotal: number;
}

export function SummaryCards({
  totalIncome,
  totalExpense,
  netCashflow,
  currentWalletsTotal
}: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <InfoCard
        title="Total Pemasukan"
        value={formatIDR(totalIncome)}
        variant="income"
        description="Semua transaksi masuk"
      />

      <InfoCard
        title="Total Pengeluaran"
        value={formatIDR(totalExpense)}
        variant="expense"
        description="Semua transaksi keluar"
      />

      <InfoCard
        title="Arus Kas Bersih"
        value={formatIDR(netCashflow)}
        variant={netCashflow >= 0 ? "success" : "danger"}
        description={netCashflow >= 0 ? "Positif (surplus)" : "Negatif (defisit)"}
      />

      <InfoCard
        title="Total Saldo Dompet"
        value={formatIDR(currentWalletsTotal)}
        variant="primary"
        description="Semua dompet aktif"
      />
    </div>
  );
}

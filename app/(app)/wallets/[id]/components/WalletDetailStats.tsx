import { InfoCard } from "@/components/ui/molecules/InfoCard";
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
  const formattedNetFlow = `${netFlow >= 0 ? "+" : "-"}${formatIDR(Math.abs(netFlow))}`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <InfoCard
        title="Total Pemasukan"
        value={formatIDR(totalIncome)}
        variant="income"
        description="Pemasukan pada dompet ini"
      />

      <InfoCard
        title="Total Pengeluaran"
        value={formatIDR(totalExpense)}
        variant="expense"
        description="Pengeluaran pada dompet ini"
      />

      <InfoCard
        title="Aliran Bersih"
        value={formattedNetFlow}
        variant={netFlow >= 0 ? "success" : "danger"}
        description={netFlow >= 0 ? "Surplus saldo dompet" : "Defisit saldo dompet"}
      />
    </div>
  );
}


import { DebtItem } from "../types";
import { formatIDR } from "../utils";
import { InfoCard } from "@/components/ui/molecules/InfoCard";

interface DebtsSummaryProps {
  debts: DebtItem[];
  isLoading?: boolean;
}

export function DebtsSummary({ debts, isLoading = false }: DebtsSummaryProps) {
  const totalDebtAmount = debts
    .filter(d => d.type === "owe" && d.status === "unpaid")
    .reduce((sum, d) => sum + (d.total_amount - d.paid_amount), 0);

  const totalLendAmount = debts
    .filter(d => d.type === "lend" && d.status === "unpaid")
    .reduce((sum, d) => sum + (d.total_amount - d.paid_amount), 0);

  // Count unique people
  const oweCount = debts.filter(d => d.type === "owe" && d.status === "unpaid").length;
  const lendCount = debts.filter(d => d.type === "lend" && d.status === "unpaid").length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Owe - Total Amount */}
      <InfoCard
        title="Total Hutang"
        value={formatIDR(totalDebtAmount)}
        variant="owe"
        description="Jumlah hutang belum lunas"
        isLoading={isLoading}
      />

      {/* Owe - Count */}
      <InfoCard
        title="Orang yang Saya Hutangi"
        value={oweCount}
        variant="owe"
        description={`-${oweCount} orang`}
        isLoading={isLoading}
      />

      {/* Lend - Total Amount */}
      <InfoCard
        title="Total Piutang"
        value={formatIDR(totalLendAmount)}
        variant="lend"
        description="Jumlah piutang belum ditagih"
        isLoading={isLoading}
      />

      {/* Lend - Count */}
      <InfoCard
        title="Orang yang Berhutang"
        value={lendCount}
        variant="lend"
        description={`-${lendCount} orang`}
        isLoading={isLoading}
      />
    </div>
  );
}

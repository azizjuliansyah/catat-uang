import { DebtItem } from "../types";
import { formatIDR } from "../utils";
import { InfoCard } from "@/components/ui/molecules/InfoCard";

interface DebtsSummaryProps {
  debts: DebtItem[];
}

export function DebtsSummary({ debts }: DebtsSummaryProps) {
  const totalDebtAmount = debts
    .filter(d => d.type === "owe" && d.status === "unpaid")
    .reduce((sum, d) => sum + (d.total_amount - d.paid_amount), 0);

  const totalLendAmount = debts
    .filter(d => d.type === "lend" && d.status === "unpaid")
    .reduce((sum, d) => sum + (d.total_amount - d.paid_amount), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Owe card */}
      <InfoCard
        title="Hutang Saya (Owe)"
        value={formatIDR(totalDebtAmount)}
        variant="danger"
        description="Total hutang belum lunas"
      />

      {/* Lend card */}
      <InfoCard
        title="Piutang Saya (Lend)"
        value={formatIDR(totalLendAmount)}
        variant="success"
        description="Total piutang belum ditagih"
      />
    </div>
  );
}

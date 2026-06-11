import { DebtItem } from "../types";
import { formatIDR } from "../utils";
import { TrendingDown, TrendingUp } from "lucide-react";
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
        icon={<TrendingDown className="w-5 h-5" />}
        variant="owe"
      />

      {/* Lend card */}
      <InfoCard
        title="Piutang Saya (Lend)"
        value={formatIDR(totalLendAmount)}
        icon={<TrendingUp className="w-5 h-5" />}
        variant="lend"
      />
    </div>
  );
}


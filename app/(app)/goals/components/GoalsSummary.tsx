import { SavingGoal } from "../types";
import { formatIDR } from "../utils";
import { InfoCard } from "@/components/ui/molecules/InfoCard";

interface GoalsSummaryProps {
  goals: SavingGoal[];
}

export function GoalsSummary({ goals }: GoalsSummaryProps) {
  const totalTargetOngoing = goals
    .filter(g => g.status === "ongoing")
    .reduce((sum, g) => sum + g.target_amount, 0);

  const totalCollected = goals
    .filter(g => g.status !== "withdrawn")
    .reduce((sum, g) => sum + g.current_amount, 0);

  const completedGoalsCount = goals.filter(g => g.status === "achieved").length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <InfoCard
        title="Target Aktif Berjalan"
        value={formatIDR(totalTargetOngoing)}
        variant="primary"
        description="Total target semua tabungan"
      />

      <InfoCard
        title="Total Dana Terkumpul"
        value={formatIDR(totalCollected)}
        variant="success"
        description="Seluruh dana di tabungan"
      />

      <InfoCard
        title="Target Berhasil Dicapai"
        value={`${completedGoalsCount} Target`}
        variant="success"
        description="Tabungan yang sudah tercapai"
      />
    </div>
  );
}

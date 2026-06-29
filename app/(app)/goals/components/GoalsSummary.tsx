import { SavingGoal } from "../types";
import { formatIDR } from "../utils";
import { InfoCard } from "@/components/ui/molecules/InfoCard";

interface GoalsSummaryProps {
  goals: SavingGoal[];
  isLoading?: boolean;
}

export function GoalsSummary({ goals, isLoading = false }: GoalsSummaryProps) {
  const totalTargetOngoing = goals
    .filter(g => g.status === "ongoing")
    .reduce((sum, g) => sum + g.target_amount, 0);

  const totalTargetAll = goals
    .reduce((sum, g) => sum + g.target_amount, 0);

  const totalCollected = goals
    .filter(g => g.status !== "withdrawn")
    .reduce((sum, g) => sum + g.current_amount, 0);

  const totalGoalsCount = goals.length;
  const completedGoalsCount = goals.filter(g => g.status === "achieved").length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <InfoCard
        title="Target Aktif Berjalan"
        value={formatIDR(totalTargetOngoing)}
        variant="primary"
        description="Total target tabungan aktif"
        isLoading={isLoading}
      />

      <InfoCard
        title="Total Dana Terkumpul"
        value={formatIDR(totalCollected)}
        variant="success"
        description="Seluruh dana di tabungan"
        isLoading={isLoading}
      />

      <InfoCard
        title="Total Keseluruhan Target"
        value={`${totalGoalsCount} Target`}
        variant="neutral"
        description="Gabungan semua target tabungan"
        isLoading={isLoading}
      />

      <InfoCard
        title="Target Berhasil Dicapai"
        value={`${completedGoalsCount} Target`}
        variant="success"
        description="Tabungan yang sudah tercapai"
        isLoading={isLoading}
      />
    </div>
  );
}

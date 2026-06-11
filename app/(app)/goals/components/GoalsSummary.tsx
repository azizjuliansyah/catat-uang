import { SavingGoal } from "../types";
import { formatIDR } from "../utils";
import { InfoCard } from "@/components/ui/molecules/InfoCard";
import { Target, PiggyBank, Trophy } from "lucide-react";

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
        icon={<Target className="w-5 h-5" />}
        variant="primary"
      />

      <InfoCard
        title="Total Dana Terkumpul"
        value={formatIDR(totalCollected)}
        icon={<PiggyBank className="w-5 h-5" />}
        variant="success"
        valueClassName="text-success"
      />

      <InfoCard
        title="Target Berhasil Dicapai"
        value={`${completedGoalsCount} Target`}
        icon={<Trophy className="w-5 h-5" />}
        variant="warning"
        valueClassName="text-warning"
      />
    </div>
  );
}


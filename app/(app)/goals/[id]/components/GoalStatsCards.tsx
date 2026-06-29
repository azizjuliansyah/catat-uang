/**
 * Goal Stats Cards Component
 * Displays target amount, remaining amount, and progress bar cards
 */

import { SavingGoal } from "../../types";
import { formatIDR } from "@/lib/utils/format";
import { InfoCard } from "@/components/ui/molecules/InfoCard";

interface GoalStatsCardsProps {
  goal: SavingGoal | null;
  isLoading?: boolean;
}

export function GoalStatsCards({ goal, isLoading = false }: GoalStatsCardsProps) {
  const remaining = goal ? Math.max(0, goal.target_amount - goal.current_amount) : 0;
  const progress = goal && goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
  const isAchieved = goal?.status === "achieved";
  const isWithdrawn = goal?.status === "withdrawn";

  const cardColor = isAchieved
    ? "#10b981" // Goal Complete
    : isWithdrawn
    ? "#a1a1aa" // Goal Withdrawn
    : "#8b5cf6"; // Goal Active

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Target amount */}
      <InfoCard
        title="Target Dana"
        value={formatIDR(goal?.target_amount || 0)}
        variant="primary"
        description="Total target tabungan"
        isLoading={isLoading || !goal}
      />

      {/* Remaining amount */}
      <InfoCard
        title={isAchieved ? "Kelebihan Dana" : "Sisa Diperlukan"}
        value={formatIDR(Math.abs(remaining))}
        variant={isAchieved ? "success" : "warning"}
        description={isAchieved ? "Dana melebihi target" : "Dana yang masih dibutuhkan"}
        isLoading={isLoading || !goal}
      />

      {/* Progress Bar Card - custom for visual bar */}
      <div className="bg-surface-card border border-border rounded-2xl p-5 flex flex-col justify-between">
        <p className="text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">
          Progres Tabungan
        </p>
        {isLoading || !goal ? (
          <div className="h-7 w-32 bg-border/40 rounded animate-pulse mt-2" />
        ) : (
          <>
            <div className="w-full h-2 bg-surface-input rounded-full overflow-hidden mt-4">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, progress)}%`,
                  backgroundColor: cardColor
                }}
              />
            </div>
            <p className="text-[10px] text-text-secondary mt-1.5 font-mono">
              {progress.toFixed(1)}% Terkumpul
            </p>
          </>
        )}
      </div>
    </div>
  );
}

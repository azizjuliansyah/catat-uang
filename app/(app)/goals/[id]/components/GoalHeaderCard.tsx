/**
 * Goal Header Card Component
 * Displays goal information card with gradient background
 */

import { SavingGoal } from "../../types";
import { formatIDR } from "@/lib/utils/format";

interface GoalHeaderCardProps {
  goal: SavingGoal | null;
  isLoading?: boolean;
}

export function GoalHeaderCard({ goal, isLoading = false }: GoalHeaderCardProps) {
  const isGoalLoading = isLoading || !goal;
  const isAchieved = goal?.status === "achieved";
  const isWithdrawn = goal?.status === "withdrawn";
  const isArchived = goal?.is_archived || false;

  return (
    <div className="bg-gradient-to-r from-surface-card to-surface/20 border border-border rounded-3xl p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {isGoalLoading ? (
              <div className="h-5 w-16 bg-border/40 rounded animate-pulse" />
            ) : (
              <>
                <span
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider ${
                    isAchieved
                      ? "bg-success/10 text-success border border-success/20"
                      : isWithdrawn
                        ? "bg-text-secondary/15 text-text-secondary border border-border"
                        : "bg-goal-active/10 text-goal-active border border-goal-active/20"
                  }`}
                >
                  {isAchieved
                    ? "Tercapai"
                    : isWithdrawn
                      ? "Ditarik"
                      : "Berjalan"}
                </span>
                {/* Archived badge */}
                {isArchived && (
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-text-secondary/15 text-text-secondary border border-border">
                    Diarsipkan
                  </span>
                )}
              </>
            )}
          </div>

          {isGoalLoading ? (
            <div className="h-7 w-48 bg-border/40 rounded animate-pulse" />
          ) : (
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              {goal.name}
            </h1>
          )}
        </div>

        <div className="text-left sm:text-right space-y-1">
          <p className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider">
            Dana Terkumpul
          </p>
          {isGoalLoading ? (
            <div className="h-9 w-36 bg-border/40 rounded animate-pulse" />
          ) : (
            <p className="text-3xl font-extrabold text-text-primary tracking-tight font-mono">
              {formatIDR(goal.current_amount)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

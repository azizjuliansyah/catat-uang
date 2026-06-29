/**
 * Goal Progress Section Component
 * Displays goal statistics
 */

import { SavingGoal } from "../../types";
import { GoalStatsCards } from "./GoalStatsCards";

interface GoalProgressSectionProps {
  goal: SavingGoal | null;
  isLoading?: boolean;
}

export function GoalProgressSection({ goal, isLoading = false }: GoalProgressSectionProps) {
  return <GoalStatsCards goal={goal} isLoading={isLoading} />;
}

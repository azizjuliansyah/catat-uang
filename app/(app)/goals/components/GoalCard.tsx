import { useState } from "react";
import { SavingGoal } from "../types";
import { getIconComponent } from "@/lib/utils/icons";
import { formatIDR } from "@/lib/utils/format";
import { Edit2, Trash2, Plus, ArrowUpRight, Calendar } from "lucide-react";
import { CardActions } from "@/components/ui/molecules/CardActions";
import { ProgressBar } from "@/components/ui/atoms/ProgressBar";
import { DynamicColorIcon } from "@/components/ui/atoms/DynamicColorIcon";
import { StatusBadge } from "@/components/ui/atoms/StatusBadge";
import { FinancialCard } from "@/components/ui/organisms/FinancialCard";
import { DetailLink } from "@/components/ui/atoms/DetailLink";
import { DateDisplay } from "@/components/ui/atoms/DateDisplay";

interface GoalCardProps {
  goal: SavingGoal;
  onEdit: (goal: SavingGoal) => void;
  onDelete: (goal: SavingGoal) => void;
  onTopup: (goal: SavingGoal) => void;
  onWithdraw: (goal: SavingGoal) => void;
}

export function GoalCard({
  goal,
  onEdit,
  onDelete,
}: GoalCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const progress = Math.min(100, (goal.current_amount / goal.target_amount) * 100);
  const remaining = Math.max(0, goal.target_amount - goal.current_amount);
  const IconComp = getIconComponent(goal.icon);
  const isAchieved = goal.status === "achieved";
  const isWithdrawn = goal.status === "withdrawn";

  const cardColor = isAchieved
    ? "#10b981" // Goal Complete
    : isWithdrawn
    ? "#a1a1aa" // Goal Withdrawn
    : "#8b5cf6"; // Goal Active

  return (
    <FinancialCard
      cardColor={cardColor}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="border border-solid relative group"
    >
      {/* Top Header Card */}
      <div className="w-full">
        <div className="flex items-start justify-between relative z-10 w-full">
          <div className="flex items-center gap-3 min-w-0">
            <DynamicColorIcon icon={IconComp} color={cardColor} size="md" variant="light" />
            <div className="min-w-0">
              <h3
                className="font-bold text-sm sm:text-base leading-tight transition-colors duration-300 truncate"
                style={{
                  color: isHovered ? cardColor : "var(--color-text-primary)"
                }}
              >
                {goal.name}
              </h3>
              <StatusBadge
                status={isAchieved ? "achieved" : isWithdrawn ? "withdrawn" : "ongoing"}
                size="sm"
                className="mt-1"
              />
            </div>
          </div>

          <CardActions
            actions={[
              { icon: Edit2, label: "Edit Target", onClick: () => onEdit(goal) },
              { icon: Trash2, label: "Hapus Target", variant: "danger", onClick: () => onDelete(goal) }
            ]}
            position="top-right"
            revealOn="group-hover"
          />
        </div>

        {/* Progress Ring / Bar Info */}
        <div className="mt-5 space-y-2 relative z-10 w-full">
          <div className="flex justify-between text-xs">
            <div>
              <p className="text-[10px] text-text-muted uppercase tracking-wider block font-semibold">Terkumpul</p>
              <p className="font-bold text-text-primary font-mono mt-0.5">{formatIDR(goal.current_amount)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-text-muted uppercase tracking-wider block font-semibold">Target</p>
              <p className="font-bold text-text-primary font-mono mt-0.5">{formatIDR(goal.target_amount)}</p>
            </div>
          </div>

          {/* Horizontal Progress bar */}
          <ProgressBar
            value={progress}
            color={cardColor}
            showPercentage
            label={`Sisa: ${formatIDR(remaining)}`}
          />
        </div>
      </div>

      {/* Bottom Actions - Target Date + Detail Button */}
      <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between relative z-10 w-full">
        <DateDisplay date={goal.target_date} label="Target:" showIcon />

        <DetailLink href={`/goals/${goal.id}`} />
      </div>
    </FinancialCard>
  );
}

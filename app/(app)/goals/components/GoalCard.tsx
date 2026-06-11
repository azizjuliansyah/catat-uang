import { useState } from "react";
import Link from "next/link";
import { SavingGoal } from "../types";
import { getIconComponent } from "@/lib/utils/icons";
import { formatIDR } from "@/lib/utils/format";
import { Edit2, Trash2, Plus, ArrowUpRight, Calendar, ArrowRight } from "lucide-react";
import { formatDateTimeShort } from "@/lib/utils/date";
import { Button } from "@/components/ui/atoms/Button";
import { ActionButton } from "@/components/ui/atoms/ActionButton";
import { DynamicColorIcon } from "@/components/ui/atoms/DynamicColorIcon";
import { StatusBadge } from "@/components/ui/atoms/StatusBadge";
import { FinancialCard } from "@/components/ui/organisms/FinancialCard";

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
  onTopup,
  onWithdraw
}: GoalCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const progress = Math.min(100, (goal.current_amount / goal.target_amount) * 100);
  const remaining = Math.max(0, goal.target_amount - goal.current_amount);
  const IconComp = getIconComponent(goal.icon);
  const isAchieved = goal.status === "achieved";
  const isWithdrawn = goal.status === "withdrawn";
  const hasFunds = goal.current_amount > 0;

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
      className="border border-solid"
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

          <div className="flex items-center gap-0.5 shrink-0">
            <ActionButton
              size="sm"
              icon={Edit2}
              title="Edit Target"
              onClick={() => onEdit(goal)}
            />
            <ActionButton
              size="sm"
              icon={Trash2}
              title="Hapus Target"
              variant="danger"
              onClick={() => onDelete(goal)}
            />
          </div>
        </div>

        {/* Progress Ring / Bar Info */}
        <div className="mt-5 space-y-2 relative z-10 w-full">
          <div className="flex justify-between text-xs">
            <div>
              <p className="text-text-secondary text-[9px] font-bold uppercase tracking-wider">Terkumpul</p>
              <p className="font-bold text-text-primary font-mono mt-0.5">{formatIDR(goal.current_amount)}</p>
            </div>
            <div className="text-right">
              <p className="text-text-secondary text-[9px] font-bold uppercase tracking-wider">Target</p>
              <p className="font-bold text-text-primary font-mono mt-0.5">{formatIDR(goal.target_amount)}</p>
            </div>
          </div>

          {/* Horizontal Progress bar */}
          <div>
            <div className="w-full h-1.5 bg-surface-input rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progress}%`,
                  backgroundColor: cardColor
                }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-text-secondary mt-1 font-mono">
              <span>Sisa: {formatIDR(remaining)}</span>
              <span>{progress.toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Actions - Target Date + Detail Button */}
      <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between relative z-10 w-full">
        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
          <Calendar className="w-4 h-4 text-text-secondary shrink-0" />
          <span className="text-[10px] font-semibold">
            Target:{" "}
            <span className="font-bold text-text-primary font-mono">
              {formatDateTimeShort(goal.target_date)}
            </span>
          </span>
        </div>

        <Link
          href={`/goals/${goal.id}`}
          className="text-xs font-bold text-primary hover:underline cursor-pointer inline-flex items-center"
        >
          Lihat Detail
          <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
        </Link>
      </div>

      {/* Quick Actions Row */}
      <div className="mt-3 flex items-center gap-2 relative z-10 w-full">
        {/* Top-up Button - only show if ongoing or not withdrawn */}
        {goal.status === "ongoing" && (
          <Button
            size="sm"
            variant="primary"
            fullWidth
            onClick={() => onTopup(goal)}
          >
            <Plus className="w-3.5 h-3.5" />
            Top-up
          </Button>
        )}

        {/* Withdraw Button - show if has funds AND not already withdrawn */}
        {hasFunds && !isWithdrawn && (
          <Button
            size="sm"
            variant="success"
            fullWidth
            onClick={() => onWithdraw(goal)}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            Tarik
          </Button>
        )}

        {/* Disabled state when withdrawn */}
        {isWithdrawn && (
          <Button
            disabled
            size="sm"
            variant="secondary"
            fullWidth
          >
            Sudah Ditarik
          </Button>
        )}
      </div>
    </FinancialCard>
  );
}

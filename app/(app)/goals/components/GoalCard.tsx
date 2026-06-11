import { useState } from "react";
import { SavingGoal } from "../types";
import { getIconComponent } from "@/lib/utils/icons";
import { calculateETAInfo } from "../utils";
import { formatIDR } from "@/lib/utils/format";
import { Edit2, Trash2, History, Plus, ArrowUpRight, Calendar, AlertCircle, Check } from "lucide-react";
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
  onHistory: (goal: SavingGoal) => void;
  onTopup: (goal: SavingGoal) => void;
  onWithdraw: (goal: SavingGoal) => void;
}

export function GoalCard({
  goal,
  onEdit,
  onDelete,
  onHistory,
  onTopup,
  onWithdraw
}: GoalCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const progress = Math.min(100, (goal.current_amount / goal.target_amount) * 100);
  const remaining = Math.max(0, goal.target_amount - goal.current_amount);
  const eta = calculateETAInfo(goal);
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

      {/* ETA details section */}
      <div className="mt-4 pt-3 border-t border-border/40 bg-surface-hover/30 p-2.5 rounded-xl border border-border/20 relative z-10 w-full">
        <div className="flex items-start gap-1.5 text-xs text-text-secondary">
          <Calendar className="w-4 h-4 text-text-secondary shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-[10px] font-semibold">
              Batas Target:{" "}
              <span className="font-bold text-text-primary font-mono">
                {formatDateTimeShort(goal.target_date)}
              </span>
            </p>

            {eta.status === "ongoing" && eta.daysLeft && (
              <p className="text-[9px] text-text-secondary leading-relaxed">
                Estimasi: <span className="font-bold text-primary">{eta.msg}</span>.
                Butuh <span className="font-bold text-text-primary font-mono">{formatIDR(eta.requiredWeekly || 0)}/mgg</span> atau <span className="font-bold text-text-primary font-mono">{formatIDR(eta.requiredMonthly || 0)}/bln</span>.
              </p>
            )}

            {eta.status === "late" && (
              <p className="text-[9px] text-danger font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                Melewati tenggat tanggal target ({formatIDR(remaining)} sisa).
              </p>
            )}

            {eta.status === "achieved" && (
              <p className="text-[9px] text-success font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5 shrink-0" />
                Dana tabungan target Anda sudah terkumpul penuh!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="mt-4 pt-3 border-t border-border/40 flex items-center gap-2 relative z-10 w-full">
        <Button
          variant="secondary"
          size="sm"
          fullWidth
          onClick={() => onHistory(goal)}
          title="Lihat Riwayat Top-up & Penarikan"
        >
          <History className="w-3.5 h-3.5" />
          Riwayat
        </Button>

        {/* Draw / Top-up Action depending on states */}
        {goal.status === "ongoing" && (
          <Button
            size="sm"
            color={cardColor}
            fullWidth
            onClick={() => onTopup(goal)}
          >
            <Plus className="w-3.5 h-3.5" />
            Top-up
          </Button>
        )}

        {goal.status === "achieved" && (
          <Button
            size="sm"
            color={cardColor}
            fullWidth
            onClick={() => onWithdraw(goal)}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            Tarik Dana
          </Button>
        )}

        {goal.status === "withdrawn" && (
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

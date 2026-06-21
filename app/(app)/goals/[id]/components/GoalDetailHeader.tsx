/**
 * Goal Detail Header Component
 * Displays goal information and navigation
 */

import Link from "next/link";
import { SavingGoal } from "../../types";
import { formatIDR } from "@/lib/utils/format";
import { PiggyBank, ArrowLeft, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/atoms/Button";

interface GoalDetailHeaderProps {
  goal: SavingGoal;
  onEdit: () => void;
  onDelete: () => void;
}

export function GoalDetailHeader({ goal, onEdit, onDelete }: GoalDetailHeaderProps) {
  const isAchieved = goal.status === "achieved";
  const isWithdrawn = goal.status === "withdrawn";

  return (
    <>
      {/* Navigation and Top Toolbar */}
      <div className="flex flex-row justify-between">
        <Link
          href="/goals"
          className="inline-flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Link>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-xs cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Ubah
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-danger hover:bg-danger/10 hover:border-danger/20 text-xs cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Hapus
          </Button>
        </div>
      </div>

      {/* Goal Header Card */}
      <div className="bg-gradient-to-r from-surface-card to-surface/20 border border-border rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider ${
                isAchieved
                  ? "bg-success/10 text-success border border-success/20"
                  : isWithdrawn
                  ? "bg-text-secondary/15 text-text-secondary border border-border"
                  : "bg-goal-active/10 text-goal-active border border-goal-active/20"
              }`}>
                {isAchieved ? "Tercapai" : isWithdrawn ? "Ditarik" : "Berjalan"}
              </span>
            </div>

            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              {goal.name}
            </h1>

            <p className="text-xs text-text-secondary flex items-center gap-1">
              <PiggyBank className="w-4 h-4 text-text-secondary" />
              Target tabungan impian Anda
            </p>
          </div>

          <div className="text-right space-y-1">
            <p className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider">Dana Terkumpul</p>
            <p className="text-3xl font-extrabold text-text-primary tracking-tight font-mono">
              {formatIDR(goal.current_amount)}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

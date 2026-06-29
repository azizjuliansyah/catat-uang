/**
 * Goal Deadline & Estimation Component
 * Displays target date and ETA information
 */

import { SavingGoal, ETAInfo } from "../../types";
import { formatIDR } from "@/lib/utils/format";
import { formatDateTimeShort } from "@/lib/utils/date";
import { Calendar, AlertCircle, CheckCircle2 } from "lucide-react";

interface GoalDeadlineEstimationProps {
  goal: SavingGoal | null;
  eta: ETAInfo | null;
  isLoading?: boolean;
}

export function GoalDeadlineEstimation({ goal, eta, isLoading = false }: GoalDeadlineEstimationProps) {
  const isGoalLoading = isLoading || !goal;
  const remaining = goal ? Math.max(0, goal.target_amount - goal.current_amount) : 0;

  return (
    <div className="bg-surface-card border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-extrabold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-text-secondary" />
          Batas Waktu & Estimasi
        </h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between py-2 border-b border-border/50">
          <span className="text-xs text-text-secondary">Tanggal Target</span>
          {isGoalLoading ? (
            <div className="h-5 w-24 bg-border/40 rounded animate-pulse" />
          ) : (
            <span className="text-sm font-bold text-text-primary font-mono">
              {formatDateTimeShort(goal.target_date)}
            </span>
          )}
        </div>

        {eta && eta.status === "ongoing" && eta.daysLeft !== undefined && (
          <div className="py-2 border-b border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-secondary">Estimasi Waktu</span>
              <span className="text-sm font-bold text-primary">{eta.msg}</span>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-3">
              <div className="bg-surface-hover rounded-lg p-3">
                <p className="text-[10px] text-text-secondary uppercase tracking-wider">Per Hari</p>
                <p className="text-sm font-bold text-text-primary font-mono mt-1">
                  {formatIDR(eta.requiredDaily || 0)}
                </p>
              </div>
              <div className="bg-surface-hover rounded-lg p-3">
                <p className="text-[10px] text-text-secondary uppercase tracking-wider">Per Minggu</p>
                <p className="text-sm font-bold text-text-primary font-mono mt-1">
                  {formatIDR(eta.requiredWeekly || 0)}
                </p>
              </div>
              <div className="bg-surface-hover rounded-lg p-3">
                <p className="text-[10px] text-text-secondary uppercase tracking-wider">Per Bulan</p>
                <p className="text-sm font-bold text-text-primary font-mono mt-1">
                  {formatIDR(eta.requiredMonthly || 0)}
                </p>
              </div>
            </div>
          </div>
        )}

        {eta && eta.status === "late" && (
          <div className="py-2 bg-danger/5 rounded-lg border border-danger/20">
            <p className="text-xs text-danger font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Melewati batas target tanggal
            </p>
            <p className="text-[10px] text-danger/80 mt-1">
              Masih butuh {formatIDR(remaining)} untuk mencapai target.
            </p>
          </div>
        )}

        {eta && eta.status === "achieved" && (
          <div className="py-2 bg-success/5 rounded-lg border border-success/20">
            <p className="text-xs text-success font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Target Tercapai!
            </p>
            <p className="text-[10px] text-success/80 mt-1">
              Selamat! Dana tabungan Anda sudah terkumpul penuh.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

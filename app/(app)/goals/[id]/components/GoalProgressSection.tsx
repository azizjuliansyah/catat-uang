/**
 * Goal Progress Section Component
 * Displays goal statistics and ETA information
 */

import { SavingGoal, ETAInfo } from "../../types";
import { formatIDR } from "@/lib/utils/format";
import { formatDateTimeShort } from "@/lib/utils/date";
import { Coins, CheckCircle2, AlertCircle, Calendar, Clock } from "lucide-react";

interface GoalProgressSectionProps {
  goal: SavingGoal;
  eta: ETAInfo;
}

export function GoalProgressSection({ goal, eta }: GoalProgressSectionProps) {
  const remaining = Math.max(0, goal.target_amount - goal.current_amount);
  const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
  const isAchieved = goal.status === "achieved";
  const isWithdrawn = goal.status === "withdrawn";

  const cardColor = isAchieved
    ? "#10b981" // Goal Complete
    : isWithdrawn
    ? "#a1a1aa" // Goal Withdrawn
    : "#8b5cf6"; // Goal Active

  return (
    <>
      {/* Grid statistics summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Target amount */}
        <div className="bg-surface-card border border-border p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <p className="text-xxs font-extrabold text-text-secondary uppercase tracking-wider flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-text-secondary" />
              Target Dana
            </p>
            <p className="text-xl font-bold text-text-primary mt-2 font-mono">
              {formatIDR(goal.target_amount)}
            </p>
          </div>
        </div>

        {/* Remaining amount */}
        <div className="bg-surface-card border border-border p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <p className="text-xxs font-extrabold text-text-secondary uppercase tracking-wider flex items-center gap-1">
              {isAchieved ? <CheckCircle2 className="w-3.5 h-3.5 text-success" /> : <AlertCircle className="w-3.5 h-3.5" />}
              {isAchieved ? "Kelebihan Dana" : "Sisa Diperlukan"}
            </p>
            <p className="text-xl font-bold text-text-primary mt-2 font-mono">
              {formatIDR(Math.abs(remaining))}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-surface-card border border-border p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <p className="text-xxs font-extrabold text-text-secondary uppercase tracking-wider">Progres Tabungan</p>
            <div className="w-full h-2 bg-surface-input rounded-full overflow-hidden mt-4">
              <div
                className={`h-full rounded-full transition-all duration-500`}
                style={{
                  width: `${Math.min(100, progress)}%`,
                  backgroundColor: cardColor
                }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-text-secondary mt-1.5 font-mono">
              <span>{progress.toFixed(1)}% Terkumpul</span>
            </div>
          </div>
        </div>
      </div>

      {/* Target Date & ETA Section */}
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
            <span className="text-sm font-bold text-text-primary font-mono">
              {formatDateTimeShort(goal.target_date)}
            </span>
          </div>

          {eta.status === "ongoing" && eta.daysLeft !== undefined && (
            <div className="py-2 border-b border-border/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-text-secondary">Estimasi Waktu</span>
                <span className="text-sm font-bold text-primary">{eta.msg}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-3">
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

          {eta.status === "late" && (
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

          {eta.status === "achieved" && (
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
    </>
  );
}

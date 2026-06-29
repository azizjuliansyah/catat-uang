/**
 * Goal Detail Header Component
 * Displays goal information and navigation
 */

import Link from "next/link";
import { SavingGoal } from "../../types";
import { ArrowLeft, CheckCircle2, Archive, RotateCcw, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/atoms/Button";
import { DropdownMenu } from "@/components/ui/molecules/DropdownMenu";
import { GoalHeaderCard } from "./GoalHeaderCard";

interface GoalDetailHeaderProps {
  goal: SavingGoal | null;
  isLoading?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onMarkComplete?: () => void;
  onToggleArchive?: () => void;
}

export function GoalDetailHeader({ goal, isLoading = false, onEdit, onDelete, onMarkComplete, onToggleArchive }: GoalDetailHeaderProps) {
  const isGoalLoading = isLoading || !goal;

  const isAchieved = goal?.status === "achieved";
  const isWithdrawn = goal?.status === "withdrawn";
  const isArchived = goal?.is_archived || false;

  return (
    <>
      {/* Navigation and Top Toolbar */}
      <div className="flex flex-row justify-start sm:justify-between gap-4">
        {isGoalLoading ? (
          <div className="h-4 w-16 bg-border/40 rounded animate-pulse" />
        ) : (
          <Link
            href="/goals"
            className="inline-flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Link>
        )}

        {!isGoalLoading && (
          <>
            {/* Desktop: Show all buttons */}
            <div className="hidden sm:flex items-center gap-2">
              {/* Archive/Unarchive */}
              {onToggleArchive && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleArchive}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-xs cursor-pointer text-text-secondary"
                >
                  {isArchived ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" />
                      Aktifkan
                    </>
                  ) : (
                    <>
                      <Archive className="w-3.5 h-3.5" />
                      Arsipkan
                    </>
                  )}
                </Button>
              )}

              {/* Mark Complete - only if not already achieved */}
              {!isAchieved && !isWithdrawn && onMarkComplete && (
                <Button
                  variant="success"
                  size="sm"
                  onClick={onMarkComplete}
                  className="flex items-center gap-1.5 text-xs cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Tandai Selesai
                </Button>
              )}

              <Button
                variant="warning"
                size="sm"
                onClick={onEdit}
                className="flex items-center gap-1.5 text-xs cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Ubah
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={onDelete}
                className="flex items-center gap-1.5 text-xs cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus
              </Button>
            </div>

            {/* Mobile: Three-dot menu */}
            <div className="sm:hidden ml-auto">
              <DropdownMenu
                triggerIcon={MoreVertical}
                triggerTitle="Menu Tujuan"
                items={[
                  ...(!isAchieved && !isWithdrawn && onMarkComplete
                      ? [
                          {
                            icon: CheckCircle2,
                            label: "Tandai Selesai",
                            variant: "success" as const,
                            onClick: onMarkComplete,
                          },
                        ]
                      : []),
                  {
                    icon: isArchived ? RotateCcw : Archive,
                    label: isArchived ? "Aktifkan Kembali" : "Arsipkan",
                    variant: "default" as const,
                    onClick: onToggleArchive || (() => {}),
                  },
                  {
                    icon: Edit2,
                    label: "Ubah Tujuan",
                    variant: "default" as const,
                    onClick: onEdit,
                  },
                  {
                    icon: Trash2,
                    label: "Hapus Tujuan",
                    variant: "danger" as const,
                    onClick: onDelete,
                  },
                ]}
                align="right"
              />
            </div>
          </>
        )}
      </div>

      {/* Goal Header Card */}
      <GoalHeaderCard goal={goal} isLoading={isLoading} />
    </>
  );
}

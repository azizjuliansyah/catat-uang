"use client";

import { Button } from "@/components/ui/atoms/Button";
import { ActionButton } from "@/components/ui/atoms/ActionButton";
import { ProgressBar } from "@/components/ui/molecules/ProgressBar";
import { getIconComponent } from "@/lib/utils/icons";
import { Plus, FolderMinus, Calendar, Edit2, Trash2 } from "lucide-react";
import { DetailLink } from "@/components/ui/atoms/DetailLink";
import { formatIDR } from "@/lib/utils/format";
import { PaylaterGridSkeleton } from "./PaylaterSkeleton";
import { PaylaterPlatform } from "../types";

interface PaylaterGridProps {
  loading: boolean;
  platforms: PaylaterPlatform[];
  onAddFirst: () => void;
  onEdit: (platform: PaylaterPlatform) => void;
  onDelete: (platform: PaylaterPlatform) => void;
}

export function PaylaterGrid({
  loading,
  platforms,
  onAddFirst,
  onEdit,
  onDelete,
}: PaylaterGridProps) {
  if (loading) {
    return <PaylaterGridSkeleton />;
  }


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {platforms.map((platform) => {
        const IconComponent = getIconComponent(platform.icon);
        const remainingLimit = platform.limit_amount - platform.balance;
        const usagePercentage = platform.limit_amount > 0
          ? Math.min((platform.balance / platform.limit_amount) * 100, 100)
          : 0;

        return (
          <div
            key={platform.id}
            className="bg-surface-card border border-border hover:border-border-strong rounded-2xl p-5 flex flex-col justify-between transition-all group relative overflow-hidden animate-fade-in"
          >
            {/* Accent Line */}
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{ backgroundColor: platform.color }}
            />

            <div className="flex items-start justify-between gap-3 relative z-10">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: platform.color }}
                >
                  <IconComponent className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-text-primary">
                    {platform.name}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-text-secondary mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-text-muted" />
                    <span>
                      Siklus: Tgl {platform.billing_cycle_date} (Jatuh Tempo +{platform.due_date_offset} hari)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-0.5 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <ActionButton
                  icon={Edit2}
                  size="sm"
                  title="Edit Platform"
                  onClick={() => onEdit(platform)}
                />
                <ActionButton
                  icon={Trash2}
                  size="sm"
                  title="Hapus Platform"
                  variant="danger"
                  onClick={() => onDelete(platform)}
                />
              </div>
            </div>

            {/* Progress & Limit details */}
            <div className="mt-5 space-y-2.5">
              <div className="flex justify-between items-end text-xs">
                <div className="space-y-0.5">
                  <div className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Digunakan / Total Limit</div>
                  <div className="font-bold text-text-primary flex items-center gap-1.5">
                    <span className="text-feedback-error">{formatIDR(platform.balance)}</span>
                    <span className="text-text-muted">/</span>
                    <span className="text-text-secondary">{formatIDR(platform.limit_amount)}</span>
                  </div>
                </div>
                <div className="text-right space-y-0.5">
                  <div className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Sisa Limit</div>
                  <div className="font-bold text-text-success">
                    {formatIDR(remainingLimit)}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <ProgressBar
                percentage={usagePercentage}
                variant="solid"
                color={platform.balance > platform.limit_amount ? "#EF4444" : platform.color}
                height="sm"
                trackColor="default"
              />
            </div>

            {/* Footer Action button */}
            <div className="mt-2 pt-2 border-t border-border/60 flex justify-end">
              <DetailLink href={`/paylater/${platform.id}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

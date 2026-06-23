"use client";

import { Button } from "@/components/ui/atoms/Button";
import { ActionButton } from "@/components/ui/atoms/ActionButton";
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

  if (platforms.length === 0) {
    return (
      <div className="bg-surface-card border border-border border-dashed rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-4 max-w-xl mx-auto mt-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-surface-hover text-text-secondary/40">
          <FolderMinus className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-text-primary">
            Belum ada platform Paylater
          </h3>
          <p className="text-xs text-text-secondary max-w-xs mx-auto leading-relaxed">
            Tambahkan platform Paylater (seperti GoPay Later, Shopee PayLater) untuk mulai mencatat dan memantau limit kredit Anda secara teratur.
          </p>
        </div>
        <Button onClick={onAddFirst} size="sm">
          <Plus className="w-4 h-4 mr-1.5" />
          Tambah Platform Pertama
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <div className="w-full h-2 bg-surface-hover rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${usagePercentage}%`,
                    backgroundColor: platform.balance > platform.limit_amount ? "#EF4444" : platform.color
                  }}
                />
              </div>
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

/**
 * PayLater Detail Header Component
 * Displays platform information and navigation
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PaylaterPlatform, PaylaterBillingDates } from "../../types";
import { getIconComponent } from "@/lib/utils/icons";
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Archive,
  RotateCcw,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/atoms/Button";
import { DropdownMenu } from "@/components/ui/molecules/DropdownMenu";

interface PaylaterDetailHeaderProps {
  platform: PaylaterPlatform | null;
  nextBillingDates: PaylaterBillingDates | null;
  isLoading?: boolean;
  onEdit?: () => void;
  onToggleArchive?: () => void;
  onDelete?: () => void;
}

export function PaylaterDetailHeader({
  platform,
  nextBillingDates,
  isLoading = false,
  onEdit,
  onToggleArchive,
  onDelete,
}: PaylaterDetailHeaderProps) {
  const router = useRouter();
  const isPlatformLoading = isLoading || !platform;

  return (
    <>
      {/* Navigation and Top Toolbar */}
      <div className="flex flex-row justify-between items-center">
        {isPlatformLoading ? (
          <div className="h-4 w-16 bg-border/40 rounded animate-pulse" />
        ) : (
          <Link
            href="/paylater"
            className="inline-flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Link>
        )}

        {/* Action Buttons */}
        {!isPlatformLoading && platform && (
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
                  {platform.is_archived ? (
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

              {/* Edit */}
              {onEdit && (
                <Button
                  variant="warning"
                  size="sm"
                  onClick={onEdit}
                  className="flex items-center gap-1.5 text-xs cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Ubah
                </Button>
              )}

              {/* Delete */}
              {onDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onDelete}
                  className="flex items-center gap-1.5 text-xs cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Hapus
                </Button>
              )}
            </div>

            {/* Mobile: Three-dot menu */}
            <div className="sm:hidden">
              <DropdownMenu
                triggerIcon={MoreVertical}
                triggerTitle="Menu Platform"
                items={[
                  {
                    icon: Edit2,
                    label: "Ubah Platform",
                    variant: "default" as const,
                    onClick: onEdit || (() => {}),
                  },
                  {
                    icon: platform.is_archived ? RotateCcw : Archive,
                    label: platform.is_archived
                      ? "Aktifkan Kembali"
                      : "Arsipkan",
                    variant: "default" as const,
                    onClick: onToggleArchive || (() => {}),
                  },
                  {
                    icon: Trash2,
                    label: "Hapus Platform",
                    variant: "danger" as const,
                    onClick: onDelete || (() => {}),
                  },
                ]}
                align="right"
              />
            </div>
          </>
        )}
      </div>

      {/* Platform Identity Card */}
      <div className="bg-surface-card border border-border rounded-2xl p-5 flex items-center justify-between gap-4 relative overflow-hidden">
        {!isPlatformLoading && (
          <div
            className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
            style={{ backgroundColor: platform.color }}
          />
        )}
        <div className="flex items-center gap-4 mt-1">
          {isPlatformLoading ? (
            <div className="w-12 h-12 rounded-xl bg-border/40 shrink-0 animate-pulse" />
          ) : (
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0"
              style={{ backgroundColor: platform.color }}
            >
              {(() => {
                const IconComponent = getIconComponent(platform.icon);
                return <IconComponent className="w-6 h-6" />;
              })()}
            </div>
          )}
          <div className="space-y-2">
            {isPlatformLoading ? (
              <>
                <div className="h-5 w-32 bg-border/40 rounded animate-pulse" />
                <div className="h-4 w-20 bg-border/40 rounded-full animate-pulse" />
              </>
            ) : (
              <>
                <h1 className="text-xl font-bold text-text-primary tracking-tight">
                  {platform.name}
                </h1>
                {platform.is_archived && (
                  <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-surface-hover text-text-secondary border border-border rounded-md mt-0.5 uppercase tracking-wider">
                    Diarsipkan
                  </span>
                )}
              </>
            )}
          </div>
        </div>
        <div className="text-right shrink-0 mt-1 space-y-1.5">
          <p className="text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">
            Siklus Tagihan
          </p>
          {isPlatformLoading ? (
            <>
              <div className="h-4 w-16 bg-border/40 rounded animate-pulse mt-1" />
              <div className="h-2.5 w-20 bg-border/40 rounded animate-pulse" />
            </>
          ) : (
            <>
              <p className="text-sm font-bold text-text-primary mt-1">
                Tgl {platform.billing_cycle_date}
              </p>
              <p className="text-[10px] text-text-secondary mt-0.5">
                +{platform.due_date_offset} hari jatuh tempo
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}

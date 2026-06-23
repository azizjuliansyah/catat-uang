"use client";

import { getIconComponent } from "@/lib/utils/icons";
import { WalletItem } from "../types";
import { formatIDR } from "@/lib/utils/format";
import { Edit2, Trash2, Archive, RotateCcw, Star } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CardActions, CardAction } from "@/components/ui/molecules/CardActions";
import { DetailLink } from "@/components/ui/atoms/DetailLink";

interface WalletCardProps {
  wallet: WalletItem;
  onEdit: (w: WalletItem) => void;
  onArchive: (w: WalletItem) => void;
  onDelete: (w: WalletItem) => void;
  onSetDefault: (w: WalletItem) => void;
}

export function WalletCard({
  wallet,
  onEdit,
  onArchive,
  onDelete,
  onSetDefault
}: WalletCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: wallet.id, disabled: wallet.is_archived });

  const WalletIcon = getIconComponent(wallet.icon);

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      className={`
        bg-surface-card border rounded-2xl p-4 relative overflow-hidden group
        transition-all duration-150 ease flex flex-col justify-between
        ${wallet.is_archived ? "" : "cursor-grab active:cursor-grabbing"}
        ${isDragging ? "border-dashed border-primary" : "border-border hover:border-border-strong"}
      `}
      {...(!wallet.is_archived ? { ...attributes, ...listeners } : {})}
    >
      {/* Top Accent Line */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: wallet.color }}
      />

      {/* Card Header */}
      <div className="flex items-start justify-between relative z-10">
        <div className="flex items-center gap-3 min-w-0">
          {/* Icon */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
            style={{ backgroundColor: wallet.color }}
          >
            <WalletIcon className="w-5 h-5" />
          </div>

          {/* Name & Badge */}
          <div className="min-w-0">
            <h3 className="text-card-title text-text-primary font-semibold truncate">
              {wallet.name}
            </h3>
            {wallet.is_default && (
              <span className="inline-block px-2 py-0.5 text-[10px] font-semibold text-primary bg-primary/10 border border-primary/20 rounded-md mt-1 uppercase tracking-wide">
                Utama
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div 
          onPointerDown={(e) => e.stopPropagation()} 
          onTouchStart={(e) => e.stopPropagation()} 
          className="cursor-default"
        >
          <CardActions
            actions={
              [
                !wallet.is_default && !wallet.is_archived && { icon: Star, label: "Setel Utama", variant: "primary" as const, onClick: () => onSetDefault(wallet) },
                { icon: Edit2, label: "Ubah Dompet", onClick: () => onEdit(wallet) },
                { icon: wallet.is_archived ? RotateCcw : Archive, label: wallet.is_archived ? "Aktifkan Kembali" : "Arsipkan Dompet", onClick: () => onArchive(wallet) },
                !wallet.is_default && { icon: Trash2, label: "Hapus Dompet", variant: "danger" as const, onClick: () => onDelete(wallet) }
              ].filter(Boolean) as CardAction[]
            }
            position="top-right"
            revealOn="group-hover"
          />
        </div>
      </div>

      {/* Card Content & Footer */}
      <div className="mt-2">
        <div className="flex flex-col gap-2">
          <div>
            <p className="text-caption text-text-secondary uppercase tracking-wide">
              Saldo saat ini
            </p>
            <p className="text-metric-sm text-text-primary font-mono mt-1">
              {formatIDR(wallet.balance)}
            </p>
          </div>

          <div 
            className="pt-2 border-t border-border/60 flex justify-end" 
            onPointerDown={(e) => e.stopPropagation()} 
            onTouchStart={(e) => e.stopPropagation()}
          >
            <DetailLink href={`/wallets/${wallet.id}`} label="Lihat Detail" />
          </div>
        </div>
      </div>
    </div>
  );
}

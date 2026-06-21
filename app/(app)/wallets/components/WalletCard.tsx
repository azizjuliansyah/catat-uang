import { useState } from "react";
import Link from "next/link";
import { getIconComponent } from "@/lib/utils/icons";
import { WalletItem } from "../types";
import { formatIDR } from "@/lib/utils/format";
import { Edit2, Trash2, Archive, RotateCcw, GripVertical, ExternalLink, Star } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ActionButton } from "@/components/ui/atoms/ActionButton";

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
  const [isHovered, setIsHovered] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: wallet.id });

  const WalletIcon = getIconComponent(wallet.icon);

  return (
    <div
      ref={setNodeRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      className={`
        bg-surface-card border rounded-lg p-5 relative overflow-hidden group
        transition-all duration-150 ease
        ${isDragging ? "border-dashed border-primary" : "border-border"}
        ${isHovered ? "border-border-strong bg-surface-hover" : ""}
      `}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 transition-opacity duration-150 ease"
        style={{
          backgroundColor: wallet.color,
          opacity: isHovered ? 0.8 : 0.3
        }}
      />

      {/* Card Header */}
      <div className="flex items-start justify-between relative z-10">
        <div className="flex items-center gap-3 min-w-0">
          {/* Drag Handle */}
          {!wallet.is_archived && (
            <ActionButton
              icon={GripVertical}
              title="Seret untuk mengurutkan"
              className="cursor-grab active:cursor-grabbing"
              {...attributes}
              {...listeners}
            />
          )}

          {/* Icon */}
          <div
            className="w-10 h-10 rounded-md flex items-center justify-center"
            style={{ backgroundColor: `${wallet.color}15` }}
          >
            <WalletIcon
              className="w-5 h-5"
              style={{ color: wallet.color }}
            />
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
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          {!wallet.is_default && !wallet.is_archived && (
            <ActionButton
              size="sm"
              icon={Star}
              title="Setel Utama"
              variant="primary"
              onClick={() => onSetDefault(wallet)}
            />
          )}
          <ActionButton
            size="sm"
            icon={Edit2}
            title="Ubah Dompet"
            onClick={() => onEdit(wallet)}
          />
          <ActionButton
            size="sm"
            icon={wallet.is_archived ? RotateCcw : Archive}
            title={wallet.is_archived ? "Aktifkan Kembali" : "Arsipkan Dompet"}
            onClick={() => onArchive(wallet)}
          />
          {!wallet.is_default && (
            <ActionButton
              size="sm"
              icon={Trash2}
              title="Hapus Dompet"
              variant="danger"
              onClick={() => onDelete(wallet)}
            />
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="mt-5 pt-4 border-t border-border/50">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-caption text-text-secondary uppercase tracking-wide">
              Saldo saat ini
            </p>
            <p className="text-metric-sm text-text-primary font-mono mt-1">
              {formatIDR(wallet.balance)}
            </p>
          </div>

          <Link
            href={`/wallets/${wallet.id}`}
            className="text-label font-semibold text-primary hover:underline flex items-center gap-1 transition-colors duration-150 ease"
          >
            <ExternalLink className="w-3 h-3" />
            Detail
          </Link>
        </div>
      </div>
    </div>
  );
}

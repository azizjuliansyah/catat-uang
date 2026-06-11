import { useState } from "react";
import { getIconComponent } from "@/lib/utils/icons";
import { WalletItem } from "../types";
import { formatIDR } from "@/lib/utils/format";
import { Edit2, Trash2, Archive, RotateCcw, GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/atoms/Button";
import { ActionButton } from "@/components/ui/atoms/ActionButton";
import { DynamicColorIcon } from "@/components/ui/atoms/DynamicColorIcon";
import { FinancialCard } from "@/components/ui/organisms/FinancialCard";

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
    <FinancialCard
      ref={setNodeRef}
      cardColor={wallet.color}
      isDragging={isDragging}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: CSS.Transform.toString(transform),
        transition
      }}
      className="h-44"
    >
      {/* Card Top */}
      <div className="flex items-start justify-between relative z-10 w-full">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Drag Handle */}
          {!wallet.is_archived && (
            <ActionButton
              icon={GripVertical}
              title="Seret untuk mengurutkan"
              className="cursor-grab active:cursor-grabbing rounded"
              {...attributes}
              {...listeners}
            />
          )}

          <DynamicColorIcon icon={WalletIcon} color={wallet.color} size="sm" variant="light" />
          <div className="min-w-0">
            <h3
              className="font-bold text-text-primary text-sm sm:text-base truncate transition-colors leading-snug"
              style={{
                color: isHovered ? wallet.color : "var(--color-text-primary)"
              }}
            >
              {wallet.name}
            </h3>
            {wallet.is_default && (
              <span className="inline-block px-1.5 py-0.5 text-[9px] font-bold bg-primary/10 text-primary border border-primary/20 rounded-md mt-0.5 uppercase tracking-wider">
                Utama
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-0.5 shrink-0">
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

      {/* Card Bottom */}
      <div className="mt-4 flex flex-col justify-end pt-2.5 border-t border-border/40 relative z-10 w-full">
        <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">Saldo saat ini</span>
        <span className="text-lg font-bold text-text-primary font-mono truncate mt-0.5">
          {formatIDR(wallet.balance)}
        </span>

        {/* Set default trigger */}
        {!wallet.is_default && !wallet.is_archived && (
          <button
            type="button"
            onClick={() => onSetDefault(wallet)}
            className="text-left text-[10px] hover:underline mt-2 font-bold flex items-center gap-0.5 self-start transition-colors duration-300 bg-transparent border-transparent p-0 h-auto"
            style={{
              color: isHovered ? wallet.color : "var(--color-primary)"
            }}
          >
            Setel Utama
          </button>
        )}
      </div>
    </FinancialCard>
  );
}

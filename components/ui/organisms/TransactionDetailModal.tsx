"use client";

import { Calendar } from "lucide-react";
import { Modal } from "@/components/ui/organisms/Modal";
import { Button } from "@/components/ui/atoms/Button";
import { ActionButton } from "@/components/ui/atoms/ActionButton";
import {
  DetailHeader,
  DetailDescriptionCard,
  DetailItemCard,
  DetailImageCard,
} from "@/components/ui/molecules/DetailComponents";
import { getIconComponent } from "@/lib/utils/icons";
import { formatDateTimeLong } from "@/lib/utils/date";
import { formatIDR } from "@/lib/utils/format";

interface Transaction {
  id: string;
  user_id: string;
  wallet_id: string | null;
  paylater_id: string | null;
  category_id: string | null;
  amount: number;
  type: "income" | "expense";
  description: string | null;
  transaction_date: string;
  receipt_url: string | null;
  created_at: string;
  wallets: {
    name: string;
    icon: string;
    color: string;
  } | null;
  paylater_platforms: {
    name: string;
    color: string;
    icon: string;
  } | null;
  categories: {
    name: string;
    icon: string;
    color: string;
  } | null;
}

interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onEdit?: (tx: Transaction) => void;
  onDelete?: (tx: Transaction) => void;
}

export function TransactionDetailModal({
  isOpen,
  onClose,
  transaction,
  onEdit,
  onDelete
}: TransactionDetailModalProps) {
  if (!transaction) return null;

  const CatIcon = transaction.categories?.icon
    ? getIconComponent(transaction.categories.icon)
    : undefined;

  const WalletOrPaylaterIcon = transaction.wallets?.icon
    ? getIconComponent(transaction.wallets.icon)
    : transaction.paylater_platforms?.icon
      ? getIconComponent(transaction.paylater_platforms.icon)
      : undefined;

  const sourceName = transaction.wallets?.name ||
    transaction.paylater_platforms?.name ||
    "Sumber Terhapus";

  const sourceColor = transaction.wallets?.color ||
    transaction.paylater_platforms?.color ||
    "#6B7280";

  const categoryName = transaction.categories?.name || "Tanpa Kategori";
  const categoryColor = transaction.categories?.color || "#6B7280";

  const isPaylater = transaction.paylater_id !== null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail Transaksi"
      footer={
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="flex-1"
          >
            Tutup
          </Button>

          <div className="flex items-center gap-2">
            {onEdit && (
              <ActionButton
                icon={() => <Edit2 className="w-4 h-4" />}
                title="Edit Transaksi"
                onClick={() => {
                  onClose();
                  onEdit(transaction);
                }}
                size="sm"
              />
            )}
            {onDelete && (
              <ActionButton
                icon={() => <Trash2 className="w-4 h-4" />}
                title="Hapus Transaksi"
                variant="danger"
                onClick={() => {
                  onClose();
                  onDelete(transaction);
                }}
                size="sm"
              />
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Header with Icon and Amount */}
        <DetailHeader
          icon={CatIcon || "HelpCircle"}
          iconColor={categoryColor}
          title={transaction.type === "income" ? "Pemasukan" : "Pengeluaran"}
          subtitle={
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDateTimeLong(transaction.transaction_date)}
            </span>
          }
          amount={transaction.amount}
          amountPrefix={transaction.type === "income" ? "+" : "-"}
          amountColorClass={transaction.type === "income" ? "text-income" : "text-expense"}
        />

        {/* Description */}
        {transaction.description && (
          <DetailDescriptionCard label="Deskripsi">
            {transaction.description}
          </DetailDescriptionCard>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Source */}
          <DetailItemCard
            label={isPaylater ? "Paylater" : "Dompet"}
            icon={WalletOrPaylaterIcon || "Wallet"}
            iconColor={sourceColor}
            value={sourceName}
          />

          {/* Category */}
          <DetailItemCard
            label="Kategori"
            icon={CatIcon || "HelpCircle"}
            iconColor={categoryColor}
            value={categoryName}
          />
        </div>

        {/* Receipt */}
        {transaction.receipt_url && (
          <DetailImageCard
            label="Bukti Transaksi / Nota"
            url={transaction.receipt_url}
            externalLink={transaction.receipt_url}
          />
        )}

      </div>
    </Modal>
  );
}

// Import icons at bottom to avoid circular dependency
import { Edit2, Trash2 } from "lucide-react";

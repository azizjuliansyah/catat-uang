"use client";

import { useState } from "react";
import {
  Wallet as WalletIcon,
  Tag,
  FileImage,
  Edit2,
  Trash2,
  HelpCircle,
  Clock,
  Calendar,
  CreditCard,
  ExternalLink,
  X
} from "lucide-react";
import { Modal } from "@/components/ui/organisms/Modal";
import { Button } from "@/components/ui/atoms/Button";
import { ActionButton } from "@/components/ui/atoms/ActionButton";
import { getIconComponent } from "@/lib/utils/icons";
import { formatDateTimeShort, formatDateTimeLong } from "@/lib/utils/date";
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
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  if (!transaction) return null;

  const CatIcon = transaction.categories?.icon
    ? getIconComponent(transaction.categories.icon)
    : HelpCircle;

  const WalletOrPaylaterIcon = transaction.wallets?.icon
    ? getIconComponent(transaction.wallets.icon)
    : transaction.paylater_platforms?.icon
    ? getIconComponent(transaction.paylater_platforms.icon)
    : WalletIcon;

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
      footer={null}
    >
      <div className="space-y-5">
        {/* Header with Icon and Amount */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-lg"
              style={{ backgroundColor: categoryColor }}
            >
              <CatIcon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-secondary">
                {transaction.type === "income" ? "Pemasukan" : "Pengeluaran"}
              </p>
              <p className="text-xs text-text-secondary flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3" />
                {formatDateTimeLong(transaction.transaction_date)}
              </p>
            </div>
          </div>

          {/* Amount */}
          <div className="text-right">
            <p className={`text-2xl font-bold font-mono ${
              transaction.type === "income" ? "text-income" : "text-expense"
            }`}>
              {transaction.type === "income" ? "+" : "-"} {formatIDR(transaction.amount)}
            </p>
          </div>
        </div>

        {/* Description */}
        {transaction.description && (
          <div className="bg-surface-card border border-border rounded-xl p-4">
            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-2">
              Deskripsi
            </p>
            <p className="text-sm text-text-primary whitespace-pre-wrap">
              {transaction.description}
            </p>
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Source */}
          <div className="bg-surface-card border border-border rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              {isPaylater ? (
                <CreditCard className="w-4 h-4 text-primary" />
              ) : (
                <WalletIcon className="w-4 h-4 text-primary" />
              )}
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                {isPaylater ? "Paylater" : "Dompet"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center text-white shrink-0"
                style={{ backgroundColor: sourceColor }}
              >
                <WalletOrPaylaterIcon className="w-3 h-3" />
              </div>
              <p className="text-sm font-medium text-text-primary truncate">
                {sourceName}
              </p>
            </div>
          </div>

          {/* Category */}
          <div className="bg-surface-card border border-border rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <Tag className="w-4 h-4 text-text-muted" />
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                Kategori
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center text-white shrink-0"
                style={{ backgroundColor: categoryColor }}
              >
                <CatIcon className="w-3 h-3" />
              </div>
              <p className="text-sm font-medium text-text-primary truncate">
                {categoryName}
              </p>
            </div>
          </div>

          {/* Time */}
          <div className="bg-surface-card border border-border rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-text-muted" />
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                Waktu
              </p>
            </div>
            <p className="text-sm text-text-primary">
              {new Date(transaction.transaction_date).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit"
              })}
            </p>
          </div>

          {/* Created At */}
          <div className="bg-surface-card border border-border rounded-xl p-3">
            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-2">
              Dibuat Pada
            </p>
            <p className="text-sm text-text-primary">
              {formatDateTimeShort(transaction.created_at)}
            </p>
          </div>
        </div>

        {/* Receipt */}
        {transaction.receipt_url && (
          <div className="bg-surface-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                <FileImage className="w-4 h-4" />
                Bukti Transaksi / Nota
              </p>
              <a
                href={transaction.receipt_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                Buka di Tab Baru
              </a>
            </div>
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-surface-hover">
              {imageError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-text-muted">
                  <FileImage className="w-8 h-8 mb-2" />
                  <p className="text-xs">Gagal memuat gambar</p>
                </div>
              ) : (
                <>
                  {imageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-surface-hover">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  <img
                    src={transaction.receipt_url}
                    alt="Bukti Transaksi"
                    className="w-full h-full object-contain"
                    onLoad={() => setImageLoading(false)}
                    onError={() => {
                      setImageLoading(false);
                      setImageError(true);
                    }}
                  />
                </>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
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
                icon={Edit2}
                title="Sunting Transaksi"
                onClick={() => {
                  onClose();
                  onEdit(transaction);
                }}
                size="sm"
              />
            )}
            {onDelete && (
              <ActionButton
                icon={Trash2}
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
      </div>
    </Modal>
  );
}

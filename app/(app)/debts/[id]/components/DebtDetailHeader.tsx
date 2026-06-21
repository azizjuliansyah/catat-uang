/**
 * Debt Detail Header Component
 * Displays debt information and navigation
 */

import Link from "next/link";
import { DebtItem } from "../types";
import { formatIDR, isOverdue } from "../../utils";
import { formatDateTimeShort } from "@/lib/utils/date";
import { Calendar, ArrowLeft, Edit2, Trash2, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/atoms/Button";

interface DebtDetailHeaderProps {
  debt: DebtItem;
  onEdit: () => void;
  onDelete: () => void;
}

export function DebtDetailHeader({ debt, onEdit, onDelete }: DebtDetailHeaderProps) {
  const remaining = debt.total_amount - debt.paid_amount;
  const isOwe = debt.type === "owe";
  const firstTxnDueDate = debt.debt_transactions?.[0]?.due_date;
  const isLate = debt.status === "unpaid" && firstTxnDueDate && isOverdue(firstTxnDueDate);

  return (
    <>
      {/* Navigation and Top Toolbar */}
      <div className="flex flex-row justify-between">
        <Link
          href="/debts"
          className="inline-flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Link>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-xs cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Ubah
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-danger hover:bg-danger/10 hover:border-danger/20 text-xs cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Hapus
          </Button>
        </div>
      </div>

      {/* Profile/Contact Name Header */}
      <div className="bg-gradient-to-r from-surface-card to-surface/20 border border-border rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider ${
                isOwe
                  ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                  : "bg-cyan-500/10 text-cyan-500 border border-cyan-500/20"
              }`}>
                {isOwe ? "Hutang Saya" : "Piutang Saya"}
              </span>

              {debt.status === "paid" ? (
                <span className="px-2.5 py-1 bg-success/10 text-success border border-success/20 rounded-lg text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Lunas
                </span>
              ) : isLate ? (
                <span className="px-2.5 py-1 bg-danger/10 text-danger border border-danger/20 rounded-lg text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 animate-pulse">
                  <Clock className="w-3 h-3" />
                  Overdue / Terlewat
                </span>
              ) : (
                <span className="px-2.5 py-1 bg-text-secondary/15 text-text-secondary border border-border rounded-lg text-[10px] font-extrabold uppercase tracking-wider">
                  Belum Lunas
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              {debt.name}
            </h1>

            {debt.debt_transactions && debt.debt_transactions.length > 0 && (
              <p className="text-xs text-text-secondary flex items-center gap-1">
                <Calendar className="w-4 h-4 text-text-secondary" />
                {debt.debt_transactions.length === 1
                  ? `Jatuh tempo pada ${formatDateTimeShort(debt.debt_transactions[0].due_date)}`
                  : `${debt.debt_transactions.length} transaksi • lihat detail di bawah`
                }
              </p>
            )}
          </div>

          <div className="text-right space-y-1">
            <p className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider">Sisa Tagihan</p>
            <p className="text-3xl font-extrabold text-text-primary tracking-tight font-mono">
              {formatIDR(remaining)}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

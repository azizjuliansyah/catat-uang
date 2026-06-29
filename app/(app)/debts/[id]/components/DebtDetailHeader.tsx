/**
 * Debt Detail Header Component
 * Displays debt information and navigation
 */

import Link from "next/link";
import { DebtItem } from "../types";
import { formatIDR, isOverdue } from "../../utils";
import { formatDateTimeShort } from "@/lib/utils/date";
import { Calendar, ArrowLeft, Edit2, Trash2, CheckCircle2, Clock, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/atoms/Button";
import { DropdownMenu } from "@/components/ui/molecules/DropdownMenu";

interface DebtDetailHeaderProps {
  debt: DebtItem | null;
  isLoading?: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function DebtDetailHeader({ debt, isLoading = false, onEdit, onDelete }: DebtDetailHeaderProps) {
  const isDebtLoading = isLoading || !debt;

  const remaining = debt ? debt.total_amount - debt.paid_amount : 0;
  const isOwe = debt?.type === "owe";
  const firstTxnDueDate = debt?.debt_transactions?.[0]?.due_date;
  const isLate = debt?.status === "unpaid" && firstTxnDueDate && isOverdue(firstTxnDueDate);

  return (
    <>
      {/* Navigation and Top Toolbar */}
      <div className="flex flex-row justify-between items-center">
        {isDebtLoading ? (
          <div className="h-4 w-16 bg-border/40 rounded animate-pulse" />
        ) : (
          <Link
            href="/debts"
            className="inline-flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Link>
        )}

        {!isDebtLoading && (
          <>
            {/* Desktop: Show all buttons */}
            <div className="hidden sm:flex items-center gap-2">
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
            <div className="sm:hidden">
              <DropdownMenu
                triggerIcon={MoreVertical}
                triggerTitle="Menu Hutang"
                items={[
                  {
                    icon: Edit2,
                    label: "Ubah Hutang",
                    variant: "default" as const,
                    onClick: onEdit,
                  },
                  {
                    icon: Trash2,
                    label: "Hapus Hutang",
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

      {/* Profile/Contact Name Header */}
      <div className="bg-gradient-to-r from-surface-card to-surface/20 border border-border rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {isDebtLoading ? (
                <div className="h-5 w-20 bg-border/40 rounded animate-pulse" />
              ) : (
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider ${
                  isOwe
                    ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                    : "bg-cyan-500/10 text-cyan-500 border border-cyan-500/20"
                }`}>
                  {isOwe ? "Hutang Saya" : "Piutang Saya"}
                </span>
              )}

              {!isDebtLoading && debt.status === "paid" ? (
                <span className="px-2.5 py-1 bg-success/10 text-success border border-success/20 rounded-lg text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Lunas
                </span>
              ) : !isDebtLoading && isLate ? (
                <span className="px-2.5 py-1 bg-danger/10 text-danger border border-danger/20 rounded-lg text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 animate-pulse">
                  <Clock className="w-3 h-3" />
                  Overdue / Terlewat
                </span>
              ) : !isDebtLoading ? (
                <span className="px-2.5 py-1 bg-text-secondary/15 text-text-secondary border border-border rounded-lg text-[10px] font-extrabold uppercase tracking-wider">
                  Belum Lunas
                </span>
              ) : null}
            </div>

            {isDebtLoading ? (
              <div className="h-7 w-48 bg-border/40 rounded animate-pulse" />
            ) : (
              <h1 className="text-2xl font-bold text-text-primary tracking-tight">
                {debt.name}
              </h1>
            )}
          </div>

          <div className="text-left md:text-right space-y-1">
            <p className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider">Sisa Tagihan</p>
            {isDebtLoading ? (
              <div className="h-9 w-36 bg-border/40 rounded animate-pulse" />
            ) : (
              <p className="text-3xl font-extrabold text-text-primary tracking-tight font-mono">
                {formatIDR(remaining)}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

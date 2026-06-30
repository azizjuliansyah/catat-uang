/**
 * PayLater Transaction List Component
 * Lists paylater transactions and supports multi-selection for payment
 */

import { PaylaterPlatform, PaylaterTransaction } from "../../types";
import { FileText, Receipt, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/atoms/Button";
import { Checkbox } from "@/components/ui/atoms/Checkbox";
import { formatIDR } from "@/lib/utils/format";
import { formatDateTimeShort } from "@/lib/utils/date";
import { getIconComponent } from "@/lib/utils/icons";

interface PaylaterTransactionListProps {
  platform: PaylaterPlatform;
  transactions: PaylaterTransaction[];
  selectedTransactionIds: Set<string>;
  toggleTransactionSelection: (id: string) => void;
  selectAllTransactions: () => void;
  clearSelection: () => void;
  setIsPaymentModalOpen: (value: boolean) => void;
}

export function PaylaterTransactionList({
  platform,
  transactions,
  selectedTransactionIds,
  toggleTransactionSelection,
  selectAllTransactions,
  clearSelection,
  setIsPaymentModalOpen
}: PaylaterTransactionListProps) {
  // Calculate total selected amount
  const selectedTotal = transactions
    .filter(t => selectedTransactionIds.has(t.id))
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="bg-surface-card border border-border rounded-2xl p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xs font-extrabold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-4 h-4" />
            Riwayat Transaksi
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">Pilih transaksi untuk dibayar</p>
        </div>

        <div className="flex items-center gap-2">
          {selectedTransactionIds.size > 0 && (
            <>
              <span className="text-xs text-text-secondary font-mono">
                {formatIDR(selectedTotal)}
              </span>
              <Button
                onClick={() => setIsPaymentModalOpen(true)}
                size="sm"
                variant="primary"
                className="text-xs"
              >
                <Receipt className="w-3.5 h-3.5 mr-1" />
                Bayar ({selectedTransactionIds.size})
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Bulk Actions */}
      {transactions.length > 0 && (
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={selectAllTransactions}
            className="text-primary hover:underline cursor-pointer"
          >
            Pilih Semua
          </button>
          <span className="text-text-muted">•</span>
          <button
            onClick={clearSelection}
            className="text-text-secondary hover:text-text-primary cursor-pointer"
          >
            Batal Pilih
          </button>
        </div>
      )}

      {/* Transaction List */}
      <div className="space-y-2">
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-xs text-text-secondary border border-dashed border-border rounded-xl">
            Belum ada transaksi menggunakan {platform.name}.
          </div>
        ) : (
          transactions.map((txn) => {
            const CategoryIcon = txn.categories ? getIconComponent(txn.categories.icon) : null;
            const isSelected = selectedTransactionIds.has(txn.id);

            return (
              <label
                key={txn.id}
                className={
                  "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all " +
                  (isSelected
                    ? "bg-primary/10 border-primary/30"
                    : "bg-surface/30 border-border hover:border-border-strong"
                  )
                }
              >
                {/* Checkbox */}
                <Checkbox
                  checked={isSelected}
                  onChange={() => toggleTransactionSelection(txn.id)}
                />

                {CategoryIcon && txn.categories && (
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: txn.categories.color + "20" }}
                  >
                    <CategoryIcon className="w-4 h-4" style={{ color: txn.categories.color }} />
                  </div>
                )}

                {/* Transaction Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-text-primary truncate">
                      {txn.description || txn.categories?.name || "Transaksi"}
                    </span>
                    <span className="text-sm font-bold text-expense font-mono shrink-0">
                      {formatIDR(txn.amount)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-text-secondary mt-0.5">
                    <span>{formatDateTimeShort(txn.transaction_date)}</span>
                    {txn.receipt_url && (
                      <a
                        href={txn.receipt_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-0.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-3 h-3" />
                        Bukti
                      </a>
                    )}
                  </div>
                </div>
              </label>
            );
          })
        )}
      </div>
    </div>
  );
}

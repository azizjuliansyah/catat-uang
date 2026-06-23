"use client";

import { useState } from "react";
import { ArrowRightLeft, ChevronRight, Calendar, HelpCircle } from "lucide-react";
import { getIconComponent } from "@/lib/utils/icons";
import { DynamicColorIcon } from "@/components/ui/atoms/DynamicColorIcon";
import { formatDateTimeShort } from "@/lib/utils/date";
import { TransactionDetailModal } from "@/components/ui/organisms/TransactionDetailModal";
import { DetailLink } from "@/components/ui/atoms/DetailLink";
import { TransactionListActions } from "@/app/(app)/transactions/components/TransactionListActions";
import { DashboardTransaction } from "../types";

interface DashboardRecentTransactionsProps {
  recentTransactions: DashboardTransaction[];
}

export function DashboardRecentTransactions({ recentTransactions }: DashboardRecentTransactionsProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  const handleDetail = (tx: any) => {
    setSelectedTransaction(tx);
    setIsDetailOpen(true);
  };

  const handleEdit = (tx: any) => {
    // Navigate to edit modal - dispatch event or use callback
    // For now, navigate to transactions page with edit intent
    window.location.href = `/transactions?edit=${tx.id}`;
  };

  const handleDelete = (tx: any) => {
    // For dashboard view, navigate to transactions page with delete intent
    // The transactions page handles delete confirmation
    window.location.href = `/transactions?delete=${tx.id}`;
  };

  return (
    <div className="bg-surface-card border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-text-primary flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          Transaksi Terbaru
        </h2>
        <DetailLink
          href="/transactions"
          label="Lihat Semua"
          icon={ChevronRight}
          iconPosition="right"
        />
      </div>

      {recentTransactions.length === 0 ? (
        <div className="text-center py-6">
          <HelpCircle className="w-8 h-8 text-text-secondary/40 mx-auto mb-2" />
          <p className="text-xs text-text-secondary">Belum ada transaksi</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recentTransactions.map((tx) => {
            const IconComponent = tx.categories ? getIconComponent(tx.categories.icon) : ArrowRightLeft;
            return (
              <div
                key={tx.id}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-input border border-border transition-all">
                  {/* Category Icon */}
                  <div className="shrink-0">
                    {tx.categories ? (
                      <DynamicColorIcon
                        icon={IconComponent}
                        color={tx.categories.color}
                        size="sm"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-surface-input flex items-center justify-center text-text-secondary/60">
                        <ArrowRightLeft className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  {/* Transaction Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-text-primary truncate">
                      {tx.description || tx.categories?.name || "Transaksi"}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-text-muted mt-0.5">
                      <span className="font-bold text-black/60">{formatDateTimeShort(tx.transaction_date)}</span>
                      {tx.wallets && (
                        <>
                          <span>•</span>
                          <span className="font-bold text-black/60">{tx.wallets.name}</span>
                        </>
                      )}
                      {tx.paylater_platforms && (
                        <>
                          <span>•</span>
                          <span className="text-danger">{tx.paylater_platforms.name}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="shrink-0 text-right">
                    <p
                      className={`text-sm font-bold font-mono ${
                        tx.type === "income" ? "text-income" : "text-expense"
                      }`}
                    >
                      {tx.type === "income" ? "+" : "-"}
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        maximumFractionDigits: 0,
                      }).format(tx.amount)}
                    </p>
                  </div>

                  {/* Actions */}
                  <TransactionListActions
                    transaction={tx}
                    onDetail={handleDetail}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </div>
              );
            })}
          </div>
          )}

      {/* Detail Dialog Modal */}
      {selectedTransaction && (
        <TransactionDetailModal
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            setSelectedTransaction(null);
          }}
          transaction={selectedTransaction}
          onEdit={handleEdit}
        />
      )}
    </div>
  );
}

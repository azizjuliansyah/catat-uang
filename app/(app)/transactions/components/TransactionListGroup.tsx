"use client";

import {
  Wallet as WalletIcon,
  Tag,
  FileImage,
  HelpCircle,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/atoms/Button";
import { TransactionListActions } from "./TransactionListActions";
import { getIconComponent } from "@/lib/utils/icons";

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

interface TransactionListGroupProps {
  uniqueDates: string[];
  groupedTransactions: { [date: string]: Transaction[] };
  formatDateLong: (dateStr: string) => string;
  formatIDR: (val: number) => string;
  setReceiptModalUrl: (url: string | null) => void;
  setTransactionToDelete: (tx: Transaction | null) => void;
  onDetail: (tx: Transaction) => void;
  onEdit: (tx: Transaction) => void;
}

export function TransactionListGroup({
  uniqueDates,
  groupedTransactions,
  formatDateLong,
  formatIDR,
  setReceiptModalUrl,
  setTransactionToDelete,
  onDetail,
  onEdit
}: TransactionListGroupProps) {

  return (
    <div className="space-y-6">
        {uniqueDates.map((date) => {
          const dayTransactions = groupedTransactions[date];
          return (
            <div key={date} className="space-y-3">
              <h3 className="text-[10px] font-bold text-text-secondary tracking-wider uppercase px-1 font-display">
                {formatDateLong(date)}
              </h3>

              <div className="space-y-2">
                {dayTransactions.map((tx) => {
                  const CatIcon = tx.categories?.icon
                    ? getIconComponent(tx.categories.icon)
                    : HelpCircle;

                  const categoryName = tx.categories?.name || null;
                  const categoryColor = tx.categories?.color || null;
                  const walletName = tx.wallets?.name || null;
                  const paylaterName = tx.paylater_platforms?.name || null;
                  const isPaylater = tx.paylater_id !== null;

                  return (
                    <div
                      key={tx.id}
                      className="bg-surface-card border border-border hover:border-border-strong rounded-2xl p-4 flex items-center justify-between transition-all group"
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        {/* Category Icon */}
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
                          style={{
                            backgroundColor: categoryColor || "#6B7280"
                          }}
                        >
                          <CatIcon className="w-5 h-5" />
                        </div>

                        {/* Details */}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-text-primary truncate">
                            {tx.description || categoryName || "Tanpa Kategori"}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            {/* Wallet or Paylater tag */}
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-text-secondary bg-surface-hover/30 border border-border px-1.5 py-0.5 rounded-lg">
                              {isPaylater ? (
                                <>
                                  <Tag className="w-3 h-3 text-primary" />
                                  {paylaterName || "Paylater Terhapus"}
                                </>
                              ) : (
                                <>
                                  <WalletIcon className="w-3 h-3 text-primary" />
                                  {walletName || "Dompet Terhapus"}
                                </>
                              )}
                            </span>
                            {/* Time tag */}
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-text-secondary bg-surface-hover/30 border border-border px-1.5 py-0.5 rounded-lg">
                              <Clock className="w-3.5 h-3.5 text-text-muted" />
                              {new Date(tx.transaction_date).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </span>
                            {/* Category Tag */}
                            {categoryName && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-text-secondary bg-surface-hover/30 border border-border px-1.5 py-0.5 rounded-lg">
                                <Tag className="w-3 h-3 text-text-muted" />
                                {categoryName}
                              </span>
                            )}
                            {/* Receipt attached icon */}
                            {tx.receipt_url && (
                              <Button
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setReceiptModalUrl(tx.receipt_url);
                                }}
                                className="inline-flex items-center gap-1 text-[10px] font-medium text-primary bg-primary/10 border border-primary/20 hover:bg-primary/20 px-1.5 py-0.5 rounded-lg transition-colors cursor-pointer min-h-0 h-auto font-sans"
                                title="Lihat Nota"
                              >
                                <FileImage className="w-3 h-3" />
                                Nota
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Amount & Actions */}
                      <div className="flex items-center gap-3 ml-4 shrink-0">
                        <span className={`text-sm font-bold font-mono ${
                          tx.type === "income" ? "text-income" : "text-expense"
                        }`}>
                          {tx.type === "income" ? "+" : "-"} {formatIDR(tx.amount)}
                        </span>

                        <TransactionListActions
                          transaction={tx}
                          onDetail={onDetail}
                          onEdit={onEdit}
                          onDelete={(tx) => setTransactionToDelete(tx)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
  );
}

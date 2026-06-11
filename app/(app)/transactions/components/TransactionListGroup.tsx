"use client";

import Link from "next/link";
import {
  Wallet as WalletIcon,
  Tag,
  FileImage,
  Edit2,
  Trash2,
  HelpCircle,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/atoms/Button";
import { ActionButton } from "@/components/ui/atoms/ActionButton";
import { getIconComponent } from "@/lib/utils/icons";

interface Transaction {
  id: string;
  user_id: string;
  wallet_id: string;
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
}

export function TransactionListGroup({
  uniqueDates,
  groupedTransactions,
  formatDateLong,
  formatIDR,
  setReceiptModalUrl,
  setTransactionToDelete
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
                const CatIcon = tx.categories
                  ? getIconComponent(tx.categories.icon)
                  : HelpCircle;
                
                return (
                  <div
                    key={tx.id}
                    className="bg-surface-card border border-border hover:border-border-strong rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow transition-all group"
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      {/* Category Icon */}
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
                        style={{
                          backgroundColor: tx.categories?.color || "#6B7280"
                        }}
                      >
                        <CatIcon className="w-5 h-5" />
                      </div>

                      {/* Details */}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-text-primary truncate">
                          {tx.description || tx.categories?.name || "Tanpa Kategori"}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          {/* Wallet tag */}
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-text-secondary bg-surface-hover/30 border border-border px-1.5 py-0.5 rounded-lg">
                            <WalletIcon className="w-3 h-3 text-primary" />
                            {tx.wallets?.name || "Dompet Terhapus"}
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
                          {tx.categories && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-text-secondary bg-surface-hover/30 border border-border px-1.5 py-0.5 rounded-lg">
                              <Tag className="w-3 h-3 text-text-muted" />
                              {tx.categories.name}
                            </span>
                          )}
                          {/* Receipt attached icon */}
                          {tx.receipt_url && (
                            <Button
                              variant="ghost"
                              onClick={() => setReceiptModalUrl(tx.receipt_url)}
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
                    <div className="flex items-center gap-4 ml-4 shrink-0">
                      <span className={`text-sm font-bold font-mono ${
                        tx.type === "income" ? "text-income" : "text-expense"
                      }`}>
                        {tx.type === "income" ? "+" : "-"} {formatIDR(tx.amount)}
                      </span>

                      <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
                        <ActionButton
                          href={`/transactions/${tx.id}`}
                          title="Sunting Transaksi"
                          icon={Edit2}
                          size="sm"
                        />
                        <ActionButton
                          icon={Trash2}
                          title="Hapus Transaksi"
                          variant="danger"
                          size="sm"
                          onClick={() => setTransactionToDelete(tx)}
                        />
                      </div>
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

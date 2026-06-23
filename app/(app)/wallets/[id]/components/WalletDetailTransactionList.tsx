import Link from "next/link";
import { Button } from "@/components/ui/atoms/Button";
import {
  Wallet as WalletIcon,
  HelpCircle,
  Clock,
  Tag,
  Plus,
  FileText
} from "lucide-react";
import { formatIDR } from "@/lib/utils/format";
import { getIconComponent } from "@/lib/utils/icons";
import { Transaction } from "../types";

interface WalletDetailTransactionListProps {
  uniqueDates: string[];
  groupedTransactions: { [date: string]: Transaction[] };
  formatDateGroup: (dateStr: string) => string;
  onTransactionClick: (tx: Transaction) => void;
}

export function WalletDetailTransactionList({
  uniqueDates,
  groupedTransactions,
  formatDateGroup,
  onTransactionClick
}: WalletDetailTransactionListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-extrabold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
          <FileText className="w-4 h-4" />
          Riwayat Transaksi
        </h3>
        <Link href="/transactions/new">
          <Button
            variant="primary"
            size="sm"
            className="text-xs flex items-center gap-1.5 border border-border px-3"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah
          </Button>
        </Link>
      </div>

      {uniqueDates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 border border-dashed border-border rounded-2xl bg-surface-card">
          <WalletIcon className="w-10 h-10 text-text-muted" />
          <p className="text-sm font-semibold text-text-secondary">Belum ada transaksi</p>
          <p className="text-xs text-text-muted text-center">
            Mulai catat transaksi pertama di dompet ini
          </p>
          <Link href="/transactions/new">
            <Button variant="primary" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Tambah Transaksi
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {uniqueDates.map((date) => {
            const dayTransactions = groupedTransactions[date];
            const dayIncome = dayTransactions
              .filter((t) => t.type === "income")
              .reduce((s, t) => s + t.amount, 0);
            const dayExpense = dayTransactions
              .filter((t) => t.type === "expense")
              .reduce((s, t) => s + t.amount, 0);

            return (
              <div key={date} className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-[10px] font-bold text-text-secondary tracking-wider uppercase font-display">
                    {formatDateGroup(date)}
                  </h4>
                  <div className="flex items-center gap-3 text-[10px] font-mono">
                    {dayIncome > 0 && (
                      <span className="text-success">+{formatIDR(dayIncome)}</span>
                    )}
                    {dayExpense > 0 && (
                      <span className="text-danger">-{formatIDR(dayExpense)}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  {dayTransactions.map((tx) => {
                    const CatIcon = tx.categories?.icon
                      ? getIconComponent(tx.categories.icon)
                      : HelpCircle;
                    const categoryColor = tx.categories?.color || "#6B7280";
                    const categoryName = tx.categories?.name || null;

                    return (
                      <div
                        key={tx.id}
                        className="bg-surface-card border border-border hover:border-border-strong rounded-2xl p-4 flex items-center justify-between transition-all cursor-pointer group"
                        onClick={() => onTransactionClick(tx)}
                      >
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
                            style={{ backgroundColor: categoryColor }}
                          >
                            <CatIcon className="w-5 h-5" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-text-primary truncate">
                              {tx.description || categoryName || "Tanpa Kategori"}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-text-secondary bg-surface-hover/30 border border-border px-1.5 py-0.5 rounded-lg">
                                <Clock className="w-3 h-3 text-text-muted" />
                                {new Date(tx.transaction_date).toLocaleTimeString("id-ID", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              {categoryName && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-text-secondary bg-surface-hover/30 border border-border px-1.5 py-0.5 rounded-lg">
                                  <Tag className="w-3 h-3 text-text-muted" />
                                  {categoryName}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`text-sm font-bold font-mono ml-4 shrink-0 ${
                            tx.type === "income" ? "text-success" : "text-danger"
                          }`}
                        >
                          {tx.type === "income" ? "+" : "-"} {formatIDR(tx.amount)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

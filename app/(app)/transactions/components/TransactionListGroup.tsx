"use client";

import {
  Wallet as WalletIcon,
  Tag,
  FileImage,
  HelpCircle,
  Clock,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { DetailLink } from "@/components/ui/atoms/DetailLink";
import { TransactionListActions } from "./TransactionListActions";
import { DatePagination } from "./DatePagination";
import { getIconComponent } from "@/lib/utils/icons";
import { Transaction } from "../types";
import { DateTotals } from "../hooks/useTransactionsState";

const ROWS_PER_PAGE_OPTIONS = [
  { value: "5", label: "5" },
  { value: "10", label: "10" },
  { value: "20", label: "20" },
  { value: "50", label: "50" },
];

interface TransactionListGroupProps {
  uniqueDates: string[];
  groupedTransactions: { [date: string]: Transaction[] };
  dateTotals: { [date: string]: DateTotals };
  formatDateLong: (dateStr: string) => string;
  formatIDR: (val: number) => string;
  setReceiptModalUrl: (url: string | null) => void;
  setTransactionToDelete: (tx: Transaction | null) => void;
  onDetail: (tx: Transaction) => void;
  onEdit: (tx: Transaction) => void;
  // Pagination props
  getDatePage: (date: string) => number;
  setDatePage: (date: string, page: number) => void;
  getDatePaginatedTransactions: (date: string) => Transaction[];
  getDateTotalPages: (date: string) => number;
  itemsPerPage: number;
  setItemsPerPage: (items: number) => void;
}

export function TransactionListGroup({
  uniqueDates,
  groupedTransactions,
  dateTotals,
  formatDateLong,
  formatIDR,
  setReceiptModalUrl,
  setTransactionToDelete,
  onDetail,
  onEdit,
  getDatePage,
  setDatePage,
  getDatePaginatedTransactions,
  getDateTotalPages,
  itemsPerPage,
  setItemsPerPage,
}: TransactionListGroupProps) {

  return (
    <div className="space-y-6">
        {uniqueDates.map((date) => {
          const totals = dateTotals[date];
          const currentPage = getDatePage(date);
          const totalPages = getDateTotalPages(date);
          const dayTransactions = getDatePaginatedTransactions(date);

          return (
            <div key={date} className="space-y-3">
              {/* Date Header with Daily Totals */}
              <div className="flex flex-col gap-2 px-1">
                {/* Top row: Date + Rows per page (mobile), or all inline (desktop) */}
                <div className="flex flex-row sm:flex-row items-center justify-between gap-2">
                  <div className="flex items-center gap-4">
                    <h3 className="text-[10px] font-bold text-text-secondary tracking-wider uppercase font-display">
                      {formatDateLong(date)}
                    </h3>
                  </div>

                  {/* Rows per page selector - always on right side */}
                  <div className="flex items-center gap-2 shrink-0 ml-auto">
                    <span className="text-xs text-text-muted">Per halaman:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setDatePage(date, 1);
                      }}
                      className="bg-surface-input border border-border rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary shrink-0"
                    >
                      {ROWS_PER_PAGE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Bottom row: Daily totals */}
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  {totals.totalIncome > 0 && (
                    <span className="flex items-center gap-1 text-income font-mono">
                      <TrendingUp className="w-3 h-3" />
                      {formatIDR(totals.totalIncome)}
                    </span>
                  )}
                  {totals.totalExpense > 0 && (
                    <span className="flex items-center gap-1 text-expense font-mono">
                      <TrendingDown className="w-3 h-3" />
                      {formatIDR(totals.totalExpense)}
                    </span>
                  )}
                  <span className={`font-mono ${totals.netFlow >= 0 ? "text-income" : "text-expense"}`}>
                    ({totals.netFlow >= 0 ? "+" : ""}{formatIDR(Math.abs(totals.netFlow))})
                  </span>
                </div>
              </div>

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
                      className="bg-surface-card border border-border hover:border-border-strong rounded-2xl py-2 md:py-3 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all group"
                    >
                      <div className="flex items-start gap-4 min-w-0 flex-1 w-full">
                        {/* Category Icon */}
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 mt-0.5"
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
                          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
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
                              <DetailLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setReceiptModalUrl(tx.receipt_url);
                                }}
                                label="Nota"
                                icon={FileImage}
                                variant="primary"
                                size="sm"
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Amount & Actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 border-t border-border/50 sm:border-none w-full sm:w-auto ml-0 sm:ml-4 shrink-0">
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

              {/* Pagination for this date */}
              <DatePagination
                date={date}
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={groupedTransactions[date].length}
                itemsPerPage={itemsPerPage}
                onPageChange={(page) => setDatePage(date, page)}
              />
            </div>
          );
        })}
      </div>
  );
}

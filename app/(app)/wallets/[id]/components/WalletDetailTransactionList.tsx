"use client";

import { useMemo } from "react";
import {
  Wallet as WalletIcon,
  HelpCircle,
  Clock,
  Tag,
  FileText,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { formatIDR } from "@/lib/utils/format";
import { getIconComponent } from "@/lib/utils/icons";
import { Transaction } from "../types";
import { DatePagination } from "@/app/(app)/transactions/components/DatePagination";

const ROWS_PER_PAGE_OPTIONS = [
  { value: "5", label: "5" },
  { value: "10", label: "10" },
  { value: "20", label: "20" },
  { value: "50", label: "50" },
];

interface WalletDetailTransactionListProps {
  uniqueDates: string[];
  groupedTransactions: { [date: string]: Transaction[] };
  formatDateGroup: (dateStr: string) => string;
  onTransactionClick: (tx: Transaction) => void;
  // Pagination props
  getDatePage: (date: string) => number;
  setDatePage: (date: string, page: number) => void;
  getDatePaginatedTransactions: (date: string) => Transaction[];
  getDateTotalPages: (date: string) => number;
  itemsPerPage: number;
  setItemsPerPage: (items: number) => void;
}

export function WalletDetailTransactionList({
  uniqueDates,
  groupedTransactions,
  formatDateGroup,
  onTransactionClick,
  getDatePage,
  setDatePage,
  getDatePaginatedTransactions,
  getDateTotalPages,
  itemsPerPage,
  setItemsPerPage,
}: WalletDetailTransactionListProps) {

  // Calculate daily totals for each date
  const dateTotals = useMemo(() => {
    const totals: { [date: string]: { totalIncome: number; totalExpense: number; netFlow: number } } = {};
    uniqueDates.forEach((date) => {
      const dayTransactions = groupedTransactions[date] || [];
      const income = dayTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const expense = dayTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0);
      totals[date] = {
        totalIncome: income,
        totalExpense: expense,
        netFlow: income - expense,
      };
    });
    return totals;
  }, [uniqueDates, groupedTransactions]);

  if (uniqueDates.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-4 h-4" />
            Riwayat Transaksi
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center py-16 gap-3 border border-dashed border-border rounded-2xl bg-surface-card">
          <WalletIcon className="w-10 h-10 text-text-muted" />
          <p className="text-sm font-semibold text-text-secondary">Belum ada transaksi</p>
          <p className="text-xs text-text-muted text-center">
            Mulai catat transaksi pertama di dompet ini
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-extrabold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
          <FileText className="w-4 h-4" />
          Riwayat Transaksi
        </h3>
      </div>

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
                {/* Top row: Date + Rows per page */}
                <div className="flex flex-row sm:flex-row items-center justify-between gap-2">
                  <div className="flex items-center gap-4">
                    <h3 className="text-[10px] font-bold text-text-secondary tracking-wider uppercase font-display">
                      {formatDateGroup(date)}
                    </h3>
                  </div>

                  {/* Rows per page selector */}
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

                  return (
                    <div
                      key={tx.id}
                      className="bg-surface-card border border-border hover:border-border-strong rounded-2xl py-2 md:py-3 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all cursor-pointer group"
                      onClick={() => onTransactionClick(tx)}
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
                          </div>
                        </div>
                      </div>

                      {/* Amount */}
                      <span className={`text-sm font-bold font-mono ml-4 shrink-0 ${
                        tx.type === "income" ? "text-income" : "text-expense"
                      }`}>
                        {tx.type === "income" ? "+" : "-"} {formatIDR(tx.amount)}
                      </span>
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
    </div>
  );
}

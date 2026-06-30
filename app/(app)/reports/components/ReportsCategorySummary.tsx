"use client";

import React from "react";
import { Layers, CheckSquare, Square, FolderKanban } from "lucide-react";
import { formatIDR } from "@/lib/utils/format";
import { getIconComponent } from "@/lib/utils/icons";
import { ReportsCategorySummaryProps } from "../types";
import { useReportsCategorySummary } from "../hooks";

// Reusable UI Components
import { Button } from "@/components/ui/atoms/Button";
import { Badge } from "@/components/ui/atoms/Badge";
import { SearchInput } from "@/components/ui/atoms/SearchInput";
import { SelectionPill } from "@/components/ui/atoms/SelectionPill";
import { FinancialCard } from "@/components/ui/organisms/FinancialCard";
import { EmptyState } from "@/components/ui/organisms/EmptyState";

export function ReportsCategorySummary({
  transactions,
  categories,
  startDate,
  endDate,
  isLoading = false,
}: ReportsCategorySummaryProps) {
  const {
    selectedIds,
    searchQuery,
    setSearchQuery,
    filteredSelectorCategories,
    selectedDetails,
    toggleCategory,
    selectAll,
    clearAll,
  } = useReportsCategorySummary(transactions, categories, startDate, endDate);

  // Split filtered selector categories into expense and income types
  const expenseCategories = React.useMemo(() => {
    return filteredSelectorCategories.filter((cat) => cat.type === "expense");
  }, [filteredSelectorCategories]);

  const incomeCategories = React.useMemo(() => {
    return filteredSelectorCategories.filter((cat) => cat.type === "income");
  }, [filteredSelectorCategories]);

  if (isLoading) {
    return (
      <div className="bg-surface-card border border-border rounded-2xl p-5 animate-pulse space-y-4">
        <div className="h-4 bg-surface-hover rounded w-1/4"></div>
        <div className="h-10 bg-surface-hover rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-32 bg-surface-hover rounded"></div>
          <div className="h-32 bg-surface-hover rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-card border border-border rounded-2xl p-5 font-sans space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="text-xs font-bold text-text-primary flex items-center gap-2 uppercase tracking-wider">
          <Layers className="w-4 h-4 text-primary" />
          Ringkasan per Kategori (Filter Tanggal)
        </h3>
        
        {/* Quick Selection Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={selectAll}
            className="text-[10px] font-bold text-primary hover:text-primary hover:bg-surface-hover flex items-center gap-1 uppercase tracking-wider h-8 min-h-[32px] px-2.5 py-1"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            Pilih Semua
          </Button>
          <span className="text-text-muted text-xs select-none">|</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="text-[10px] font-bold text-text-muted hover:text-text-primary hover:bg-surface-hover flex items-center gap-1 uppercase tracking-wider h-8 min-h-[32px] px-2.5 py-1"
          >
            <Square className="w-3.5 h-3.5" />
            Kosongkan
          </Button>
        </div>
      </div>

      {/* Search and Category Selector */}
      <div className="space-y-4 bg-surface-hover/30 p-4 rounded-xl border border-border/40">
        <SearchInput
          placeholder="Cari kategori..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onClear={() => setSearchQuery("")}
          showClearButton={true}
          size="sm"
          containerClassName="w-full sm:w-full"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
          {/* Expense Categories Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-border/40 pb-1">
              <span className="text-[10px] font-bold text-expense uppercase tracking-wider">
                Pilih Kategori Pengeluaran
              </span>
            </div>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1">
              {expenseCategories.length > 0 ? (
                expenseCategories.map((cat) => {
                  const isSelected = selectedIds.has(cat.id);
                  const IconComp = getIconComponent(cat.icon);

                  return (
                    <SelectionPill
                      key={cat.id}
                      active={isSelected}
                      color={cat.color}
                      icon={IconComp}
                      onClick={() => toggleCategory(cat.id)}
                    >
                      {cat.name}
                    </SelectionPill>
                  );
                })
              ) : (
                <div className="text-text-muted text-[11px] py-1 select-none">
                  Kategori pengeluaran tidak ditemukan.
                </div>
              )}
            </div>
          </div>

          {/* Income Categories Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-border/40 pb-1">
              <span className="text-[10px] font-bold text-income uppercase tracking-wider">
                Pilih Kategori Pemasukan
              </span>
            </div>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1">
              {incomeCategories.length > 0 ? (
                incomeCategories.map((cat) => {
                  const isSelected = selectedIds.has(cat.id);
                  const IconComp = getIconComponent(cat.icon);

                  return (
                    <SelectionPill
                      key={cat.id}
                      active={isSelected}
                      color={cat.color}
                      icon={IconComp}
                      onClick={() => toggleCategory(cat.id)}
                    >
                      {cat.name}
                    </SelectionPill>
                  );
                })
              ) : (
                <div className="text-text-muted text-[11px] py-1 select-none">
                  Kategori pemasukan tidak ditemukan.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown Display */}
      {selectedIds.size > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Expenses Column */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
              <h4 className="text-[11px] font-bold text-expense uppercase tracking-wider flex items-center gap-1.5">
                <Badge variant="expense">Pengeluaran</Badge>
              </h4>
              <span className="text-xs font-mono font-bold text-expense">
                {formatIDR(selectedDetails.totalExpenseNominal)}
              </span>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {selectedDetails.expenses.length > 0 ? (
                selectedDetails.expenses.map((cat) => {
                  const IconComp = getIconComponent(cat.icon);
                  return (
                    <FinancialCard
                      key={cat.id}
                      cardColor={cat.color}
                      className="py-2.5 px-3 flex-row items-center justify-between cursor-default min-h-[44px]"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${cat.color}15` }}
                        >
                          <IconComp
                            className="w-4 h-4"
                            style={{ color: cat.color }}
                          />
                        </div>
                        <span className="text-xs font-bold text-text-primary truncate">
                          {cat.name}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-expense shrink-0">
                        {formatIDR(cat.amount)}
                      </span>
                    </FinancialCard>
                  );
                })
              ) : (
                <div className="text-text-muted text-xs py-4 text-center select-none">
                  Tidak ada kategori pengeluaran terpilih.
                </div>
              )}
            </div>
          </div>

          {/* Income Column */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
              <h4 className="text-[11px] font-bold text-income uppercase tracking-wider flex items-center gap-1.5">
                <Badge variant="income">Pemasukan</Badge>
              </h4>
              <span className="text-xs font-mono font-bold text-income">
                {formatIDR(selectedDetails.totalIncomeNominal)}
              </span>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {selectedDetails.income.length > 0 ? (
                selectedDetails.income.map((cat) => {
                  const IconComp = getIconComponent(cat.icon);
                  return (
                    <FinancialCard
                      key={cat.id}
                      cardColor={cat.color}
                      className="py-2.5 px-3 flex-row items-center justify-between cursor-default min-h-[44px]"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${cat.color}15` }}
                        >
                          <IconComp
                            className="w-4 h-4"
                            style={{ color: cat.color }}
                          />
                        </div>
                        <span className="text-xs font-bold text-text-primary truncate">
                          {cat.name}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-income shrink-0">
                        {formatIDR(cat.amount)}
                      </span>
                    </FinancialCard>
                  );
                })
              ) : (
                <div className="text-text-muted text-xs py-4 text-center select-none">
                  Tidak ada kategori pemasukan terpilih.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={FolderKanban}
          title="Belum Ada Kategori Terpilih"
          description="Pilih kategori di atas untuk melihat ringkasan nominal transaksi."
          className="py-10"
        />
      )}
    </div>
  );
}

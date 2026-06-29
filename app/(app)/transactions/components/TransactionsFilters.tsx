"use client";

import { SlidersHorizontal, Layers, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/atoms/Button";
import { TabButton, TabButtonGroup } from "@/components/ui/molecules/TabButtonGroup";
import { SearchInput } from "@/components/ui/atoms/SearchInput";
import { CustomSelect } from "@/components/ui/atoms/CustomSelect";
import { DatePeriodFilter } from "@/components/ui/atoms/DatePeriodFilter";
import {
  Wallet,
  Category,
  PERIOD_OPTIONS,
  getWalletOptions,
  getIncomeCategoryOptions,
  getExpenseCategoryOptions,
} from "./filters/FilterOptions";

interface TransactionsFiltersProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  dateRangeType: string;
  setDateRangeType: (val: string) => void;
  customStartDate: string;
  setCustomStartDate: (val: string) => void;
  customEndDate: string;
  setCustomEndDate: (val: string) => void;
  showFilters: boolean;
  setShowFilters: (val: boolean) => void;
  selectedType: "all" | "income" | "expense";
  setSelectedType: (val: "all" | "income" | "expense") => void;
  selectedWalletId: string;
  setSelectedWalletId: (val: string) => void;
  selectedCategoryId: string;
  setSelectedCategoryId: (val: string) => void;
  wallets: Wallet[];
  categories: Category[];
}

export function TransactionsFilters({
  searchTerm,
  setSearchTerm,
  dateRangeType,
  setDateRangeType,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  showFilters,
  setShowFilters,
  selectedType,
  setSelectedType,
  selectedWalletId,
  setSelectedWalletId,
  selectedCategoryId,
  setSelectedCategoryId,
  wallets,
  categories,
}: TransactionsFiltersProps) {
  const walletOptions = getWalletOptions(wallets);
  const incomeCategoryOptions = getIncomeCategoryOptions(categories);
  const expenseCategoryOptions = getExpenseCategoryOptions(categories);

  const selectedIncomeCategory = categories.find((c) => c.id === selectedCategoryId && c.type === "income");
  const selectedExpenseCategory = categories.find((c) => c.id === selectedCategoryId && c.type === "expense");

  const incomeVal = selectedIncomeCategory ? selectedCategoryId : "all";
  const expenseVal = selectedExpenseCategory ? selectedCategoryId : "all";

  return (
    <div className="bg-surface-card border border-border rounded-2xl p-4 space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <SearchInput
          placeholder="Cari deskripsi atau kategori..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          showClearButton={!!searchTerm}
          onClear={() => setSearchTerm("")}
        />

        {/* Date Selector Dropdown */}
        <DatePeriodFilter
          value={dateRangeType}
          onChange={setDateRangeType}
          customStartDate={customStartDate}
          setCustomStartDate={setCustomStartDate}
          customEndDate={customEndDate}
          setCustomEndDate={setCustomEndDate}
          options={PERIOD_OPTIONS}
          size="sm"
          className="w-full sm:w-auto shrink-0"
        />

        {/* Filter toggle */}
        <Button
          variant={showFilters ? "primary" : "ghost"}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="sm:w-auto rounded-xl"
        >
          <SlidersHorizontal className="w-4 h-4 mr-1.5" />
          Filter
        </Button>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border/50 animate-fade-in">
          {/* Type Filter */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Jenis Transaksi</label>
            <TabButtonGroup variant="pill" className="h-10 items-center gap-1">
              <TabButton
                isActive={selectedType === "all"}
                onClick={() => setSelectedType("all")}
                variant="pill"
                className="px-2 py-0 h-full text-xs flex-1"
              >
                <Layers className="w-3.5 h-3.5 mr-1.5 inline" />
                Semua
              </TabButton>
              <TabButton
                isActive={selectedType === "income"}
                onClick={() => setSelectedType("income")}
                variant="pill"
                className="px-2 py-0 h-full text-xs flex-1"
              >
                <TrendingUp className="w-3.5 h-3.5 mr-1.5 inline" />
                Masuk
              </TabButton>
              <TabButton
                isActive={selectedType === "expense"}
                onClick={() => setSelectedType("expense")}
                variant="pill"
                className="px-2 py-0 h-full text-xs flex-1"
              >
                <TrendingDown className="w-3.5 h-3.5 mr-1.5 inline" />
                Keluar
              </TabButton>
            </TabButtonGroup>
          </div>

          {/* Wallet Filter */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Dompet</label>
            <CustomSelect
              options={walletOptions}
              value={selectedWalletId}
              onChange={(val) => setSelectedWalletId(val || "all")}
              placeholder="Semua Dompet"
              size="sm"
            />
          </div>

          {/* Category Masuk Filter */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Kategori Masuk</label>
            <CustomSelect
              options={incomeCategoryOptions}
              value={incomeVal}
              onChange={(val) => setSelectedCategoryId(val || "all")}
              placeholder="Semua Kategori Masuk"
              size="sm"
            />
          </div>

          {/* Category Keluar Filter */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Kategori Keluar</label>
            <CustomSelect
              options={expenseCategoryOptions}
              value={expenseVal}
              onChange={(val) => setSelectedCategoryId(val || "all")}
              placeholder="Semua Kategori Keluar"
              size="sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}

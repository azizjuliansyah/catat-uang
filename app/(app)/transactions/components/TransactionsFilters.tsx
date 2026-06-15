"use client";

import React from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/atoms/Button";
import { TabButton } from "@/components/ui/molecules/TabButton";
import CustomSelect from "@/components/ui/atoms/CustomSelect";
import { DatePeriodFilter } from "@/components/ui/atoms/DatePeriodFilter";

interface Wallet {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
}

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
  categories
}: TransactionsFiltersProps) {
  const periodOptions = [
    { value: "1week", label: "Satu Minggu yang Lalu" },
    { value: "2weeks", label: "Dua Minggu yang Lalu" },
    { value: "1month", label: "Sebulan yang Lalu" },
    { value: "3months", label: "3 Bulan yang Lalu" },
    { value: "custom", label: "Custom Tanggal" }
  ];

  const walletOptions = [
    { value: "all", label: "Semua Dompet" },
    ...wallets.map((w) => ({
      value: w.id,
      label: w.name,
    })),
  ];

  const incomeCategoryOptions = [
    { value: "all", label: "Semua Kategori Masuk" },
    ...categories
      .filter((c) => c.type === "income")
      .map((c) => ({
        value: c.id,
        label: c.name,
      })),
  ];

  const expenseCategoryOptions = [
    { value: "all", label: "Semua Kategori Keluar" },
    ...categories
      .filter((c) => c.type === "expense")
      .map((c) => ({
        value: c.id,
        label: c.name,
      })),
  ];

  const selectedIncomeCategory = categories.find((c) => c.id === selectedCategoryId && c.type === "income");
  const selectedExpenseCategory = categories.find((c) => c.id === selectedCategoryId && c.type === "expense");

  const incomeVal = selectedIncomeCategory ? selectedCategoryId : "all";
  const expenseVal = selectedExpenseCategory ? selectedCategoryId : "all";

  return (
    <div className="bg-surface-card border border-border rounded-2xl p-4 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari deskripsi atau kategori..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-surface-input border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-text-primary text-xs outline-none transition-all focus-glow"
          />
        </div>

        {/* Date Selector Dropdown */}
        <DatePeriodFilter
          value={dateRangeType}
          onChange={setDateRangeType}
          customStartDate={customStartDate}
          setCustomStartDate={setCustomStartDate}
          customEndDate={customEndDate}
          setCustomEndDate={setCustomEndDate}
          options={periodOptions}
          size="sm"
          className="w-full sm:w-56 shrink-0"
        />

        {/* Filter toggle */}
        <Button
          variant={showFilters ? "primary" : "secondary"}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="sm:w-auto"
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
            <div className="flex bg-surface-hover/30 p-1 border border-border rounded-xl h-10 items-center">
              <TabButton
                isActive={selectedType === "all"}
                onClick={() => setSelectedType("all")}
                className="flex-1 py-0 h-full text-xs rounded-lg"
              >
                Semua
              </TabButton>
              <TabButton
                isActive={selectedType === "income"}
                onClick={() => setSelectedType("income")}
                className="flex-1 py-0 h-full text-xs rounded-lg"
              >
                Masuk
              </TabButton>
              <TabButton
                isActive={selectedType === "expense"}
                onClick={() => setSelectedType("expense")}
                className="flex-1 py-0 h-full text-xs rounded-lg"
              >
                Keluar
              </TabButton>
            </div>
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

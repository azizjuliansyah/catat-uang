"use client";

import React from "react";
import { BarChart4, Table } from "lucide-react";
import { TabButton } from "@/components/ui/molecules/TabButton";
import CustomSelect from "@/components/ui/atoms/CustomSelect";
import { DatePeriodFilter } from "@/components/ui/atoms/DatePeriodFilter";

type PeriodFilterType = "this_month" | "last_3_months" | "last_6_months" | "this_year" | "custom";

interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
}

interface PeriodFilterProps {
  periodFilter: PeriodFilterType;
  setPeriodFilter: (filter: PeriodFilterType) => void;
  customStartDate: string;
  setCustomStartDate: (date: string) => void;
  customEndDate: string;
  setCustomEndDate: (date: string) => void;
  viewMode: "visual" | "tabular";
  setViewMode: (mode: "visual" | "tabular") => void;
  selectedCategoryId: string;
  setSelectedCategoryId: (categoryId: string) => void;
  categories: Category[];
}

export function PeriodFilter({
  periodFilter,
  setPeriodFilter,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  viewMode,
  setViewMode,
  selectedCategoryId,
  setSelectedCategoryId,
  categories
}: PeriodFilterProps) {
  const periodOptions = [
    { value: "this_month", label: "Bulan Ini" },
    { value: "last_3_months", label: "3 Bulan Terakhir" },
    { value: "last_6_months", label: "6 Bulan Terakhir" },
    { value: "this_year", label: "Tahun Ini" },
    { value: "custom", label: "Custom Tanggal" }
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
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-surface-card border border-border p-4 rounded-2xl shadow-sm">
      {/* Filter inputs group */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 flex-grow">
        {/* Date Dropdown */}
        <DatePeriodFilter
          value={periodFilter}
          onChange={(val) => setPeriodFilter(val as PeriodFilterType)}
          customStartDate={customStartDate}
          setCustomStartDate={setCustomStartDate}
          customEndDate={customEndDate}
          setCustomEndDate={setCustomEndDate}
          options={periodOptions}
          size="sm"
          className="w-full sm:w-56 shrink-0"
        />

        {/* Category Masuk Filter */}
        <div className="relative w-full sm:w-56 shrink-0">
          <CustomSelect
            options={incomeCategoryOptions}
            value={incomeVal}
            onChange={(val) => setSelectedCategoryId(val || "all")}
            placeholder="Semua Kategori Masuk"
            size="sm"
          />
        </div>

        {/* Category Keluar Filter */}
        <div className="relative w-full sm:w-56 shrink-0">
          <CustomSelect
            options={expenseCategoryOptions}
            value={expenseVal}
            onChange={(val) => setSelectedCategoryId(val || "all")}
            placeholder="Semua Kategori Keluar"
            size="sm"
          />
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="bg-surface-hover/30 border border-border p-1 rounded-xl flex gap-1 h-10 items-center self-stretch md:self-auto justify-center md:justify-start">
        <TabButton
          isActive={viewMode === "visual"}
          onClick={() => setViewMode("visual")}
          className="flex-1 md:flex-none px-4 py-0 h-full text-xs rounded-lg whitespace-nowrap"
        >
          <BarChart4 className="w-3.5 h-3.5 mr-1.5 inline" />
          Grafik
        </TabButton>
        <TabButton
          isActive={viewMode === "tabular"}
          onClick={() => setViewMode("tabular")}
          className="flex-1 md:flex-none px-4 py-0 h-full text-xs rounded-lg whitespace-nowrap"
        >
          <Table className="w-3.5 h-3.5 mr-1.5 inline" />
          Tabular
        </TabButton>
      </div>
    </div>
  );
}

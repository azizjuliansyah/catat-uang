"use client";

import { BarChart4, Table } from "lucide-react";
import { TabButton, TabButtonGroup } from "@/components/ui/molecules/TabButtonGroup";
import CustomSelect from "@/components/ui/atoms/CustomSelect";
import { DatePeriodFilter } from "@/components/ui/atoms/DatePeriodFilter";

type PeriodFilterType = "this_month" | "last_3_months" | "last_6_months" | "this_year" | "custom";

interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
}

interface ReportsFilterBarProps {
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

export function ReportsFilterBar({
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
}: ReportsFilterBarProps) {
  const periodOptions = [
    { value: "this_month", label: "Bulan Ini" },
    { value: "last_3_months", label: "3 Bulan Terakhir" },
    { value: "last_6_months", label: "6 Bulan Terakhir" },
    { value: "this_year", label: "Tahun Ini" },
    { value: "custom", label: "Custom Tanggal" }
  ];

  const incomeCategories = categories.filter((c) => c.type === "income");
  const expenseCategories = categories.filter((c) => c.type === "expense");

  const incomeCategoryOptions = [
    { value: "all", label: "Semua Kategori Masuk" },
    ...incomeCategories.map((c) => ({ value: c.id, label: c.name }))
  ];

  const expenseCategoryOptions = [
    { value: "all", label: "Semua Kategori Keluar" },
    ...expenseCategories.map((c) => ({ value: c.id, label: c.name }))
  ];

  const selectedIncomeCategory = categories.find((c) => c.id === selectedCategoryId && c.type === "income");
  const selectedExpenseCategory = categories.find((c) => c.id === selectedCategoryId && c.type === "expense");

  const incomeVal = selectedIncomeCategory ? selectedCategoryId : "all";
  const expenseVal = selectedExpenseCategory ? selectedCategoryId : "all";

  return (
    <div className="bg-surface-card border border-border rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Date period selector */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
        <DatePeriodFilter
          value={periodFilter}
          onChange={(val) => setPeriodFilter(val as PeriodFilterType)}
          customStartDate={customStartDate}
          setCustomStartDate={setCustomStartDate}
          customEndDate={customEndDate}
          setCustomEndDate={setCustomEndDate}
          options={periodOptions}
          size="sm"
          className="w-full sm:w-auto"
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
      <TabButtonGroup variant="pill" className="h-10 items-center gap-1 self-stretch md:self-auto justify-center md:justify-start">
        <TabButton
          isActive={viewMode === "visual"}
          onClick={() => setViewMode("visual")}
          variant="pill"
          className="flex-1 md:flex-none px-2 py-0 h-full text-xs rounded-lg whitespace-nowrap"
        >
          <BarChart4 className="w-3.5 h-3.5 mr-1.5 inline" />
          Grafik
        </TabButton>
        <TabButton
          isActive={viewMode === "tabular"}
          onClick={() => setViewMode("tabular")}
          variant="pill"
          className="flex-1 md:flex-none px-2 py-0 h-full text-xs rounded-lg whitespace-nowrap"
        >
          <Table className="w-3.5 h-3.5 mr-1.5 inline" />
          Tabular
        </TabButton>
      </TabButtonGroup>
    </div>
  );
}

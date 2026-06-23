"use client";

import { TabButton, TabButtonGroup } from "@/components/ui/molecules/TabButtonGroup";
import { Search, TrendingDown, TrendingUp } from "lucide-react";

interface CategoriesFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categoryType: "expense" | "income";
  onTypeChange: (type: "expense" | "income") => void;
}

export function CategoriesFilterBar({
  searchTerm,
  onSearchChange,
  categoryType,
  onTypeChange,
}: CategoriesFilterBarProps) {
  return (
    <div className="bg-surface-card border border-border rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Search Box */}
      <div className="relative flex-1 sm:w-60">
        <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Cari template..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 bg-surface-input border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-xs text-text-primary outline-none transition-all focus-glow h-10"
        />
      </div>

      {/* Type Tabs */}
      <TabButtonGroup variant="pill" className="h-10 items-center gap-1 w-full md:w-auto">
        <TabButton
          isActive={categoryType === "expense"}
          onClick={() => onTypeChange("expense")}
          variant="pill"
          className="flex-1 md:flex-none px-2 py-0 h-full text-xs rounded-lg"
        >
          <TrendingDown className="w-3.5 h-3.5 mr-1.5 inline" />
          Pengeluaran
        </TabButton>
        <TabButton
          isActive={categoryType === "income"}
          onClick={() => onTypeChange("income")}
          variant="pill"
          className="flex-1 md:flex-none px-2 py-0 h-full text-xs rounded-lg"
        >
          <TrendingUp className="w-3.5 h-3.5 mr-1.5 inline" />
          Pemasukan
        </TabButton>
      </TabButtonGroup>
    </div>
  );
}

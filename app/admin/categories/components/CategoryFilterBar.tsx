"use client";

import { TabButton, TabButtonGroup } from "@/components/ui/molecules/TabButtonGroup";
import { SearchInput } from "@/components/ui/atoms/SearchInput";
import { TrendingDown, TrendingUp } from "lucide-react";

interface CategoryFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categoryType: "expense" | "income";
  onTypeChange: (type: "expense" | "income") => void;
}

export function CategoryFilterBar({
  searchTerm,
  onSearchChange,
  categoryType,
  onTypeChange,
}: CategoryFilterBarProps) {
  return (
    <div className="bg-surface-card border border-border rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Search Box */}
      <div className="flex-1 sm:w-60">
        <SearchInput
          placeholder="Cari template..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
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

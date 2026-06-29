"use client";

import { SearchInput } from "@/components/ui/atoms/SearchInput";
import { TabButtonGroup, TabButton } from "@/components/ui/molecules/TabButtonGroup";
import { WalletItem } from "../types";
import { Wallet, Archive } from "lucide-react";

interface WalletsFilterBarProps {
  activeTab: "active" | "archived";
  onTabChange: (tab: "active" | "archived") => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  wallets: WalletItem[];
}

export function WalletsFilterBar({
  activeTab,
  onTabChange,
  searchTerm,
  onSearchChange,
  wallets,
}: WalletsFilterBarProps) {
  const activeCount = wallets.filter((w) => !w.is_archived).length;
  const archivedCount = wallets.filter((w) => w.is_archived).length;

  return (
    <div className="bg-surface-card border border-border rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Search Bar */}
      <SearchInput
        placeholder="Cari dompet..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        showClearButton={!!searchTerm}
        onClear={() => onSearchChange("")}
        containerClassName="w-full md:w-auto"
      />

      {/* Tabs */}
      <TabButtonGroup variant="pill" className="h-10 items-center gap-1 w-full md:w-auto">
        <TabButton
          isActive={activeTab === "active"}
          onClick={() => onTabChange("active")}
          variant="pill"
          className="px-2 py-0 h-full text-xs flex-1 md:flex-none md:min-w-[100px]"
        >
          <Wallet className="w-3.5 h-3.5 mr-1.5 inline" />
          Aktif ({activeCount})
        </TabButton>
        <TabButton
          isActive={activeTab === "archived"}
          onClick={() => onTabChange("archived")}
          variant="pill"
          className="px-2 py-0 h-full text-xs flex-1 md:flex-none md:min-w-[100px]"
        >
          <Archive className="w-3.5 h-3.5 mr-1.5 inline" />
          Terarsip ({archivedCount})
        </TabButton>
      </TabButtonGroup>
    </div>
  );
}

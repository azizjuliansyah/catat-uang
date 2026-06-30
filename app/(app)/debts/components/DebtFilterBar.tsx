import { TabButton, TabButtonGroup } from "@/components/ui/molecules/TabButtonGroup";
import { SearchInput } from "@/components/ui/atoms/SearchInput";
import { ArrowDownLeft, ArrowUpRight, Circle, CheckCircle } from "lucide-react";

interface DebtFilterBarProps {
  activeTab: "owe" | "lend";
  onTabChange: (tab: "owe" | "lend") => void;
  subTab: "active" | "settled";
  onSubTabChange: (tab: "active" | "settled") => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export function DebtFilterBar({
  activeTab,
  onTabChange,
  subTab,
  onSubTabChange,
  searchTerm,
  onSearchChange
}: DebtFilterBarProps) {
  return (
    <div className="bg-surface-card border border-border rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">

      {/* Search Box */}
      <SearchInput
        placeholder="Cari kontak atau catatan..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        showClearButton={!!searchTerm}
        onClear={() => onSearchChange("")}
      />

      {/* Search & SubTab */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
        {/* Main Tab Owe / Lend */}
        <TabButtonGroup variant="pill" uniformWidth className="h-10 items-center gap-1">
          <TabButton
            isActive={activeTab === "owe"}
            onClick={() => {
              onTabChange("owe");
              onSearchChange("");
            }}
            variant="pill"
            className="px-2 py-0 h-full text-xs"
          >
            <ArrowDownLeft className="w-3.5 h-3.5 mr-1.5 inline" />
            Hutang Saya
          </TabButton>
          <TabButton
            isActive={activeTab === "lend"}
            onClick={() => {
              onTabChange("lend");
              onSearchChange("");
            }}
            variant="pill"
            className="px-2 py-0 h-full text-xs"
          >
            <ArrowUpRight className="w-3.5 h-3.5 mr-1.5 inline" />
            Piutang Saya
          </TabButton>
        </TabButtonGroup>

        {/* SubTab Active / Settled */}
        <TabButtonGroup variant="pill" uniformWidth className="h-10 items-center gap-1">
          <TabButton
            isActive={subTab === "active"}
            onClick={() => onSubTabChange("active")}
            variant="pill"
            className="px-2 py-0 h-full text-xs"
          >
            <Circle className="w-3.5 h-3.5 mr-1.5 inline" />
            Aktif
          </TabButton>
          <TabButton
            isActive={subTab === "settled"}
            onClick={() => onSubTabChange("settled")}
            variant="pill"
            className="px-2 py-0 h-full text-xs"
          >
            <CheckCircle className="w-3.5 h-3.5 mr-1.5 inline" />
            Lunas
          </TabButton>
        </TabButtonGroup>
      </div>
    </div>
  );
}

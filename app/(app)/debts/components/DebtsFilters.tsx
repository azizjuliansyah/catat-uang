import { TabButton } from "@/components/ui/molecules/TabButton";
import { Search } from "lucide-react";

interface DebtsFiltersProps {
  activeTab: "owe" | "lend";
  onTabChange: (tab: "owe" | "lend") => void;
  subTab: "active" | "settled";
  onSubTabChange: (tab: "active" | "settled") => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export function DebtsFilters({
  activeTab,
  onTabChange,
  subTab,
  onSubTabChange,
  searchTerm,
  onSearchChange
}: DebtsFiltersProps) {
  return (
    <div className="bg-surface-card border border-border rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">

      {/* Search Box */}
      <div className="relative flex-1 sm:w-60">
        <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Cari kontak atau catatan..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 bg-surface-input border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-text-primary text-xs outline-none transition-all focus-glow h-10"
        />
      </div>
      

      {/* Search & SubTab */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
        {/* Main Tab Owe / Lend */}
        <div className="bg-surface-hover/30 border border-border p-1 rounded-xl flex gap-1 self-stretch md:self-auto h-10 items-center">
          <TabButton
            isActive={activeTab === "owe"}
            onClick={() => {
              onTabChange("owe");
              onSearchChange("");
            }}
            className="flex-1 md:flex-none px-4 py-0 h-full text-xs rounded-lg"
          >
            Hutang Saya
          </TabButton>
          <TabButton
            isActive={activeTab === "lend"}
            onClick={() => {
              onTabChange("lend");
              onSearchChange("");
            }}
            className="flex-1 md:flex-none px-4 py-0 h-full text-xs rounded-lg"
          >
            Piutang Saya
          </TabButton>
        </div>
        
        {/* SubTab Active / Settled */}
        <div className="border border-border/70 rounded-xl p-1 flex gap-1 bg-surface-hover/30 h-10 items-center">
          <TabButton
            isActive={subTab === "active"}
            onClick={() => onSubTabChange("active")}
            className="flex-1 sm:flex-none px-4 py-0 h-full text-xs rounded-lg"
          >
            Aktif
          </TabButton>
          <TabButton
            isActive={subTab === "settled"}
            onClick={() => onSubTabChange("settled")}
            className="flex-1 sm:flex-none px-4 py-0 h-full text-xs rounded-lg"
          >
            Lunas
          </TabButton>
        </div>        
      </div>
    </div>
  );
}

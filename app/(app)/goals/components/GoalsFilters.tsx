import { TabButton } from "@/components/ui/molecules/TabButton";
import { Search } from "lucide-react";

interface GoalsFiltersProps {
  statusFilter: "all" | "ongoing" | "achieved" | "withdrawn";
  searchTerm: string;
  onStatusFilterChange: (filter: "all" | "ongoing" | "achieved" | "withdrawn") => void;
  onSearchChange: (term: string) => void;
}

export function GoalsFilters({
  statusFilter,
  searchTerm,
  onStatusFilterChange,
  onSearchChange
}: GoalsFiltersProps) {
  const tabs = [
    { key: "all", label: "Semua" },
    { key: "ongoing", label: "Aktif" },
    { key: "achieved", label: "Tercapai" },
    { key: "withdrawn", label: "Ditarik" }
  ] as const;

  return (
    <div className="bg-surface-card border border-border rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Search Input */}
      <div className="relative flex-1 sm:w-60">
        <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Cari target tabungan..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 bg-surface-input border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-text-primary text-xs outline-none transition-all focus-glow h-10"
        />
      </div>

      {/* Status Filter tabs */}
      <div className="bg-surface-hover/30 border border-border p-1 rounded-xl flex gap-1 self-stretch md:self-auto overflow-x-auto max-w-full h-10 items-center">
        {tabs.map((tab) => (
          <TabButton
            key={tab.key}
            isActive={statusFilter === tab.key}
            onClick={() => onStatusFilterChange(tab.key)}
            className="flex-1 md:flex-none px-4 py-0 h-full text-xs rounded-lg"
          >
            {tab.label}
          </TabButton>
        ))}
      </div>
    </div>
  );
}

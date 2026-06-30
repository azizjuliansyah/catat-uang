import { TabButton, TabButtonGroup } from "@/components/ui/molecules/TabButtonGroup";
import { SearchInput } from "@/components/ui/atoms/SearchInput";
import { Layers, Target, CheckCircle, Download } from "lucide-react";

interface GoalFilterBarProps {
  statusFilter: "all" | "ongoing" | "achieved" | "withdrawn";
  searchTerm: string;
  onStatusFilterChange: (filter: "all" | "ongoing" | "achieved" | "withdrawn") => void;
  onSearchChange: (term: string) => void;
}

export function GoalFilterBar({
  statusFilter,
  searchTerm,
  onStatusFilterChange,
  onSearchChange
}: GoalFilterBarProps) {
  const tabs = [
    { key: "all", label: "Semua", icon: Layers },
    { key: "ongoing", label: "Aktif", icon: Target },
    { key: "achieved", label: "Tercapai", icon: CheckCircle },
    { key: "withdrawn", label: "Ditarik", icon: Download }
  ] as const;

  return (
    <div className="bg-surface-card border border-border rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Search Input */}
      <SearchInput
        placeholder="Cari target tabungan..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        showClearButton={!!searchTerm}
        onClear={() => onSearchChange("")}
      />

      {/* Status Filter tabs */}
      <TabButtonGroup variant="pill" className="h-10 items-center gap-1">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <TabButton
              key={tab.key}
              isActive={statusFilter === tab.key}
              onClick={() => onStatusFilterChange(tab.key)}
              variant="pill"
              className="px-2 py-0 h-full text-xs flex-1"
            >
              <IconComponent className="w-3.5 h-3.5 mr-1.5 inline" />
              {tab.label}
            </TabButton>
          );
        })}
      </TabButtonGroup>
    </div>
  );
}

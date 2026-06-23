import React from "react";
import { SlidersHorizontal } from "lucide-react";
import { SearchInput } from "../atoms/SearchInput";
import { CustomSelect } from "../atoms/CustomSelect";
import { DatePeriodFilter } from "../atoms/DatePeriodFilter";
import { Button } from "../atoms/Button";
import { TabButtonGroup } from "../molecules/TabButtonGroup";

interface FilterBarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  layout?: "horizontal" | "vertical" | "responsive";
  collapsible?: boolean;
  defaultExpanded?: boolean;
  className?: string;
}

function FilterBarRoot({
  children,
  layout = "responsive",
  collapsible = false,
  defaultExpanded = true,
  className = "",
  ...props
}: FilterBarProps) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  const layoutClasses = {
    horizontal: "flex-row items-center",
    vertical: "flex-col",
    responsive: "flex-col md:flex-row",
  };

  return (
    <div
      className={`bg-surface-card border border-border rounded-2xl p-4 ${
        layoutClasses[layout]
      } gap-3 md:gap-4 ${className}`}
      {...props}
    >
      {collapsible && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="md:hidden text-text-secondary hover:text-text-primary text-sm flex items-center gap-1"
        >
          {isExpanded ? "Sembunyikan" : "Tampilkan"} Filter
        </button>
      )}
      <div
        className={`flex flex-col md:flex-row items-stretch gap-3 flex-1 space-y-4 md:space-y-0 ${
          collapsible && !isExpanded ? "hidden md:flex" : ""
        }`}
      >
        {children}
      </div>
    </div>
  );
}

// Toggle sub-component
interface FilterBarToggleProps {
  show: boolean;
  onToggle: () => void;
  label?: string;
  className?: string;
}

function FilterBarToggle({
  show,
  onToggle,
  label = "Filter",
  className = "",
}: FilterBarToggleProps) {
  return (
    <Button
      variant={show ? "primary" : "secondary"}
      size="sm"
      onClick={onToggle}
      className={`sm:w-auto ${className}`}
    >
      <SlidersHorizontal className="w-4 h-4 mr-1.5" />
      {label}
    </Button>
  );
}

// Section sub-component for expandable filters
interface FilterBarSectionProps {
  show: boolean;
  children: React.ReactNode;
  layout?: "grid" | "flex";
  gridCols?: "1" | "2" | "3" | "4";
  className?: string;
}

function FilterBarSection({
  show,
  children,
  layout = "grid",
  gridCols = "4",
  className = "",
}: FilterBarSectionProps) {
  if (!show) return null;

  const gridColsClasses = {
    "1": "grid-cols-1",
    "2": "grid-cols-1 sm:grid-cols-2",
    "3": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    "4": "grid-cols-1 sm:grid-cols-2 md:grid-cols-4",
  };

  const layoutClass = layout === "grid" ? gridColsClasses[gridCols] : "flex";

  return (
    <div
      className={`${layoutClass} gap-4 pt-4 border-t border-border/50 animate-fade-in ${className}`}
    >
      {children}
    </div>
  );
}

// Compound component pattern
interface FilterBarCompound extends React.FC<FilterBarProps> {
  Search: typeof SearchInput;
  Filter: typeof CustomSelect;
  DateRange: typeof DatePeriodFilter;
  Tabs: typeof TabButtonGroup;
  Actions: React.FC<{ children: React.ReactNode; className?: string }>;
  Toggle: typeof FilterBarToggle;
  Section: typeof FilterBarSection;
}

const FilterBar = FilterBarRoot as FilterBarCompound;

FilterBar.Search = SearchInput;
FilterBar.Filter = CustomSelect;
FilterBar.DateRange = DatePeriodFilter;
FilterBar.Tabs = TabButtonGroup;

FilterBar.Actions = function FilterBarActions({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`flex items-center gap-2 ${className}`}>{children}</div>;
};

FilterBar.Toggle = FilterBarToggle;
FilterBar.Section = FilterBarSection;

export { FilterBar };

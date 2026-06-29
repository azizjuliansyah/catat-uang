"use client";

import React from "react";
import { getIconComponent } from "@/lib/utils/icons";

interface IconPreset {
  name: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface IconSelectorProps {
  icons: IconPreset[] | string[];
  selected: string;
  onSelect: (icon: string) => void;
  columns?: 4 | 5 | 6 | 7 | 8;
  size?: "sm" | "md" | "lg";
  getIconComponent?: (name: string) => React.ComponentType<{ className?: string }>;
  label?: string;
  labelClassName?: string;
  className?: string;
  required?: boolean;
}

export function IconSelector({
  icons,
  selected,
  onSelect,
  columns = 7,
  size = "sm",
  getIconComponent: customGetIcon,
  label,
  labelClassName = "",
  className = "",
  required = false,
}: IconSelectorProps) {
  const gridColsMap: Record<number, string> = {
    4: "grid-cols-3 sm:grid-cols-4",
    5: "grid-cols-3 sm:grid-cols-5",
    6: "grid-cols-3 sm:grid-cols-6",
    7: "grid-cols-3 sm:grid-cols-7",
    8: "grid-cols-3 sm:grid-cols-8",
  };

  const iconNames = icons.map((i) => (typeof i === "string" ? i : i.name));
  const getIconFn = customGetIcon || getIconComponent;

  // Size mapping for icon container
  const sizeMap: Record<string, string> = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  // Size mapping for icon itself
  const iconSizeMap: Record<string, string> = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  // Max 4 rows visible (3 items per row on mobile = 12 items max visible)
  const maxVisibleRows = 4;
  const mobileCols = 3;
  const gridGapClass = "gap-3";
  const gapSize = 12; // gap-3 = 0.75rem = 12px
  const itemPaddingClass = "p-3";
  const paddingSize = 12; // p-3 = 0.75rem = 12px
  const labelHeight = 20; // approximate label height
  const itemHeight = 72; // approximate item height (icon + text + padding)
  const gridContainerPadding = 12; // p-3
  const maxHeight = (maxVisibleRows * itemHeight) + ((maxVisibleRows - 1) * gapSize) + (gridContainerPadding * 2);

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className={`text-xs font-semibold text-text-secondary flex items-center gap-1.5 ${labelClassName}`}>
          {label}
          {required && <span className="text-danger">*</span>}
        </label>
      )}
      <div
        className={`grid ${gridColsMap[columns]} ${gridGapClass} bg-surface-input border border-border p-3 rounded-xl overflow-y-auto`}
        style={{ maxHeight: `${maxHeight}px` }}
        role="radiogroup"
        aria-label={label || "Icon selector"}
      >
        {iconNames.map((iconName) => {
          const IconComp = getIconFn(iconName);
          if (!IconComp) return null;

          const isSelected = selected === iconName;
          const formattedName = iconName
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");

          return (
            <button
              key={iconName}
              type="button"
              onClick={() => onSelect(iconName)}
              className={`p-3 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer min-h-0 h-auto font-sans font-medium select-none active:scale-[0.98] focus:outline-none w-full border-2 ${
                isSelected
                  ? "border-primary bg-surface-hover/50 text-primary font-semibold"
                  : "border-transparent text-text-secondary hover:bg-surface-hover hover:text-text-primary"
              }`}
              title={formattedName}
            >
              <div
                className={`${sizeMap[size]} rounded-lg flex items-center justify-center shrink-0 bg-primary/10`}
              >
                <IconComp className={iconSizeMap[size]} />
              </div>
              <span className="text-[10px] truncate w-full">{formattedName}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

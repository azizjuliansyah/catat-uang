import React from "react";
import { ActionButton } from "../atoms/ActionButton";
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
}: IconSelectorProps) {
  const gridColsMap: Record<number, string> = {
    4: "grid-cols-4",
    5: "grid-cols-5",
    6: "grid-cols-6",
    7: "grid-cols-7",
    8: "grid-cols-8",
  };

  const iconNames = icons.map((i) => (typeof i === "string" ? i : i.name));
  const getIconFn = customGetIcon || getIconComponent;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className={`text-label text-text-secondary block ${labelClassName}`}>
          {label}
        </label>
      )}
      <div
        className={`grid ${gridColsMap[columns]} gap-2`}
        role="radiogroup"
        aria-label={label || "Icon selector"}
      >
        {iconNames.map((iconName) => {
          const IconComp = getIconFn(iconName);
          if (!IconComp) return null;

          const isSelected = selected === iconName;

          return (
            <ActionButton
              key={iconName}
              icon={IconComp}
              title={iconName}
              variant={isSelected ? "primary" : "ghost"}
              size={size}
              onClick={() => onSelect(iconName)}
              className={isSelected ? "!border-primary" : ""}
            />
          );
        })}
      </div>
    </div>
  );
}

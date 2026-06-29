"use client";

import React from "react";
import { Check } from "lucide-react";

interface ColorPreset {
  name: string;
  hex: string;
}

interface ColorPickerProps {
  colors: ColorPreset[];
  selected: string;
  onSelect: (color: string) => void;
  allowCustom?: boolean;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  label?: string;
  customColorLabel?: string;
  labelClassName?: string;
  className?: string;
  required?: boolean;
  columns?: 4 | 5 | 6 | 7 | 8;
}

export function ColorPicker({
  colors,
  selected,
  onSelect,
  allowCustom = true,
  size = "md",
  showLabel = true,
  label,
  customColorLabel = "Custom",
  labelClassName = "",
  className = "",
  required = false,
  columns = 7,
}: ColorPickerProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  const iconSizeMap: Record<string, string> = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const gridColsMap: Record<number, string> = {
    4: "grid-cols-3 sm:grid-cols-4",
    5: "grid-cols-3 sm:grid-cols-5",
    6: "grid-cols-3 sm:grid-cols-6",
    7: "grid-cols-3 sm:grid-cols-7",
    8: "grid-cols-3 sm:grid-cols-8",
  };

  const [customColor, setCustomColor] = React.useState(selected);
  const [isCustomMode, setIsCustomMode] = React.useState(
    !colors.some((c) => c.hex.toLowerCase() === selected.toLowerCase())
  );

  // Update custom color when selected changes externally
  React.useEffect(() => {
    const isCustom = !colors.some((c) => c.hex.toLowerCase() === selected.toLowerCase());
    setIsCustomMode(isCustom);
    if (isCustom) {
      setCustomColor(selected);
    }
  }, [selected, colors]);

  const handleCustomColorChange = (value: string) => {
    setCustomColor(value);
    onSelect(value);
  };

  // Max 4 rows visible (3 items per row on mobile = 12 items max visible)
  const maxVisibleRows = 4;
  const gridGapClass = "gap-3";
  const gapSize = 12; // gap-3 = 0.75rem = 12px
  const itemPaddingClass = "p-3";
  const paddingSize = 12; // p-3 = 0.75rem = 12px
  const itemHeight = 72; // approximate item height (color circle + text + padding)
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
      <div className={`grid ${gridColsMap[columns]} gap-3 bg-surface-input border border-border p-3 rounded-xl items-center overflow-y-auto`}
        style={{ maxHeight: `${maxHeight}px` }}
      >
        {colors.map((color) => {
          const isSelected = !isCustomMode && color.hex.toLowerCase() === selected.toLowerCase();
          return (
            <button
              key={color.hex}
              type="button"
              onClick={() => {
                setIsCustomMode(false);
                onSelect(color.hex);
              }}
              className={`p-3 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer min-h-0 h-auto font-sans font-medium select-none active:scale-[0.98] focus:outline-none w-full border-2 ${
                isSelected
                  ? "border-primary bg-surface-hover/50 text-primary font-semibold"
                  : "border-transparent text-text-secondary hover:bg-surface-hover hover:text-text-primary"
              }`}
              title={color.name}
            >
              <div
                className={`${sizeClasses[size]} rounded-full flex items-center justify-center shrink-0 relative`}
                style={{ backgroundColor: color.hex }}
              >
                {isSelected && <Check className={`${iconSizeMap[size]} text-white absolute inset-0 m-auto`} />}
              </div>
              <span className="text-[10px] truncate w-full">{color.name}</span>
            </button>
          );
        })}

        {allowCustom && (
          <div
            className={`p-3 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer min-h-0 h-auto font-sans font-medium select-none w-full border-2 ${
              isCustomMode
                ? "border-primary bg-surface-hover/50 text-primary font-semibold"
                : "border-transparent text-text-secondary hover:bg-surface-hover hover:text-text-primary"
            }`}
          >
            <input
              type="color"
              value={customColor}
              onChange={(e) => {
                setIsCustomMode(true);
                handleCustomColorChange(e.target.value);
              }}
              className={`${sizeClasses[size]} rounded-full cursor-pointer border-0 bg-transparent`}
              title={customColorLabel}
            />
            <span className="text-[10px] truncate w-full font-mono">{customColor.toUpperCase()}</span>
          </div>
        )}
      </div>
    </div>
  );
}

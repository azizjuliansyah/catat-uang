import React from "react";
import { Button } from "../atoms/Button";
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
}: ColorPickerProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
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

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className={`text-label text-text-secondary block ${labelClassName}`}>
          {label}
        </label>
      )}
      <div className="flex flex-wrap gap-2 items-center">
        {colors.map((color) => {
          const isSelected = !isCustomMode && color.hex.toLowerCase() === selected.toLowerCase();
          return (
            <Button
              key={color.hex}
              type="button"
              variant="ghost"
              onClick={() => {
                setIsCustomMode(false);
                onSelect(color.hex);
              }}
              style={{ backgroundColor: color.hex }}
              className={`${sizeClasses[size]} rounded-full border-2 transition-all cursor-pointer relative min-h-0 h-auto p-0 hover:scale-110`}
              title={color.name}
            >
              {isSelected && (
                <Check className="w-3.5 h-3.5 text-white absolute inset-0 m-auto" />
              )}
            </Button>
          );
        })}

        {allowCustom && (
          <div
            className={`flex items-center gap-1.5 ml-auto border border-border bg-surface-input px-2.5 py-1.5 rounded-xl ${isCustomMode ? "border-primary ring-1 ring-primary" : ""}`}
          >
            <input
              type="color"
              value={customColor}
              onChange={(e) => {
                setIsCustomMode(true);
                handleCustomColorChange(e.target.value);
              }}
              className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
              title={customColorLabel}
            />
            <input
              type="text"
              value={customColor.toUpperCase()}
              onChange={(e) => {
                const value = e.target.value;
                if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                  setIsCustomMode(true);
                  handleCustomColorChange(value || "#000000");
                }
              }}
              placeholder="#000000"
              className="bg-transparent border-0 outline-none w-16 text-[10px] font-mono text-text-primary text-right uppercase"
            />
          </div>
        )}
      </div>
    </div>
  );
}

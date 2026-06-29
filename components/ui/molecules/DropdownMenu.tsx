import React, { useState, useRef, useEffect } from "react";
import { ActionButton } from "../atoms/ActionButton";
import { LucideIcon } from "lucide-react";

export interface DropdownMenuItem {
  label: string;
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: "default" | "danger" | "success" | "primary";
  disabled?: boolean;
  dividerAfter?: boolean;
}

interface DropdownMenuProps {
  triggerIcon: LucideIcon | React.ComponentType<{ className?: string }>;
  triggerTitle?: string;
  items: DropdownMenuItem[];
  align?: "left" | "right";
  className?: string;
}

export function DropdownMenu({
  triggerIcon,
  triggerTitle = "Menu Aksi",
  items,
  align = "right",
  className = "",
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const alignClasses = align === "left" ? "left-0" : "right-0";

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <ActionButton
        icon={triggerIcon}
        variant="ghost"
        size="sm"
        onClick={toggleMenu}
        title={triggerTitle}
      />

      {isOpen && (
        <div className={`absolute ${alignClasses} mt-1 w-36 bg-surface-card border border-border rounded-xl z-50 text-xs animate-in fade-in slide-in-from-top-1 duration-100 overflow-hidden`}>
          {items.map((item, index) => {
            const isFirst = index === 0;
            const isLast = index === items.length - 1;

            // Build item classes dynamically
            let buttonClasses = "w-full flex items-center gap-2 px-2.5 py-1.5 text-left transition-colors font-medium";

            // Handle hover and text styles based on variant
            if (item.variant === "danger") {
              buttonClasses += " text-danger hover:bg-danger/10";
            } else if (item.variant === "success") {
              buttonClasses += " text-success hover:bg-success/10";
            } else if (item.variant === "primary") {
              buttonClasses += " text-primary hover:bg-primary/10";
            } else {
              buttonClasses += " text-text-primary hover:bg-surface-hover";
            }

            // Apply corner rounding for first/last elements to align perfectly with rounded-xl container
            if (isFirst && isLast) {
              buttonClasses += " rounded-xl";
            } else if (isFirst) {
              buttonClasses += " rounded-t-[11px]";
            } else if (isLast) {
              buttonClasses += " rounded-b-[11px]";
            }

            if (item.disabled) {
              buttonClasses += " opacity-40 cursor-not-allowed";
            }

            const Icon = item.icon;

            return (
              <React.Fragment key={index}>
                <button
                  type="button"
                  disabled={item.disabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (item.disabled) return;
                    setIsOpen(false);
                    item.onClick();
                  }}
                  className={buttonClasses}
                >
                  {Icon && (
                    <Icon
                      className={`w-3.5 h-3.5 shrink-0 ${
                        item.variant === "danger"
                          ? "text-danger"
                          : item.variant === "success"
                          ? "text-success"
                          : item.variant === "primary"
                          ? "text-primary"
                          : "text-text-muted"
                      }`}
                    />
                  )}
                  <span className="truncate">{item.label}</span>
                </button>
                {item.dividerAfter && !isLast && (
                  <div className="h-px bg-border" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
}

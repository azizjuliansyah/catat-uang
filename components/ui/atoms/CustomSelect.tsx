"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
  KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check, X } from "lucide-react";

// ============================================
// Types
// ============================================

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  hasError?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  searchable?: boolean;
  clearable?: boolean;
  required?: boolean;
  name?: string;
}

// ============================================
// Context
// ============================================

interface SelectContextValue {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  selectedValue: string | undefined;
  selectOption: (value: string) => void;
  clearSelection: () => void;
  size: "sm" | "md" | "lg";
  disabled: boolean;
  hasError: boolean;
  searchable: boolean;
  clearable: boolean;
  placeholder: string;
  wrapperRef: React.RefObject<HTMLDivElement | null>;
  triggerRect: DOMRect | null;
}

const SelectContext = createContext<SelectContextValue | null>(null);

const useSelectContext = () => {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error("Select components must be used within CustomSelect");
  }
  return context;
};

// ============================================
// Trigger Button (sub-component, unused in main flow but kept for composability)
// ============================================

interface SelectTriggerProps {
  children: React.ReactNode;
}

const SelectTrigger = ({ children }: SelectTriggerProps) => {
  const { isOpen, setIsOpen, selectedValue, clearSelection, size, disabled, hasError, clearable } =
    useSelectContext();

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs min-h-[36px] rounded-lg",
    md: "px-3.5 py-2.5 text-xs min-h-[44px] rounded-xl",
    lg: "px-4 py-3 text-sm min-h-[52px] rounded-xl",
  };

  const stateClasses = hasError
    ? "border-danger focus:border-danger focus:ring-2 focus:ring-danger/20"
    : "border-border hover:border-border-strong focus:border-primary focus:ring-2 focus:ring-primary/20";

  const disabledClasses = disabled
    ? "opacity-50 cursor-not-allowed bg-surface-hover"
    : "cursor-pointer bg-surface-input";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => !disabled && setIsOpen(!isOpen)}
      className={`
        w-full flex items-center justify-between gap-2
        border outline-none transition-all duration-200
        ${sizeClasses[size]}
        ${stateClasses}
        ${disabledClasses}
      `}
    >
      <span className="flex-1 text-left truncate">{children}</span>
      <div className="flex items-center gap-1 shrink-0">
        {clearable && selectedValue && !disabled && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); clearSelection(); }}
            className="p-1 rounded-md hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors"
            tabIndex={-1}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        <ChevronDown
          className={`w-4 h-4 text-text-muted transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </div>
    </button>
  );
};

// ============================================
// Dropdown Menu (rendered via portal to escape modal overflow)
// ============================================

interface SelectDropdownProps {
  options: SelectOption[];
}

const SelectDropdown = ({ options }: SelectDropdownProps) => {
  const { isOpen, setIsOpen, selectOption, selectedValue, size, disabled, wrapperRef, triggerRect } =
    useSelectContext();

  const dropdownRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideDropdown = dropdownRef.current?.contains(target);
      const insideWrapper = wrapperRef.current?.contains(target);
      if (!insideDropdown && !insideWrapper) {
        setIsOpen(false);
        setFocusedIndex(-1);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, setIsOpen, wrapperRef]);

  // Focus first option on open
  useEffect(() => {
    if (isOpen) setFocusedIndex(0);
  }, [isOpen]);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (!isOpen) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setFocusedIndex((prev) => (prev + 1 >= filteredOptions.length ? 0 : prev + 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusedIndex((prev) => (prev - 1 < 0 ? filteredOptions.length - 1 : prev - 1));
          break;
        case "Enter":
          e.preventDefault();
          if (focusedIndex >= 0 && filteredOptions[focusedIndex]) {
            selectOption(filteredOptions[focusedIndex].value);
            setIsOpen(false);
            setFocusedIndex(-1);
            setSearchQuery("");
          }
          break;
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          setFocusedIndex(-1);
          setSearchQuery("");
          break;
        case "Tab":
          if (focusedIndex >= 0 && filteredOptions[focusedIndex]) {
            selectOption(filteredOptions[focusedIndex].value);
          }
          setIsOpen(false);
          setFocusedIndex(-1);
          break;
      }
    },
    [isOpen, filteredOptions, focusedIndex, selectOption, setIsOpen]
  );

  const sizeClasses = {
    sm: "max-h-[180px]",
    md: "max-h-[220px]",
    lg: "max-h-[260px]",
  };

  const optionSizeClasses = {
    sm: "py-1.5 px-3 text-xs rounded-lg",
    md: "py-2 px-3.5 text-xs rounded-xl",
    lg: "py-2.5 px-4 text-sm rounded-xl",
  };

  if (!isOpen || disabled || !isMounted || !triggerRect) return null;

  const spaceBelow = window.innerHeight - triggerRect.bottom;
  const shouldDropUp = spaceBelow < 260;

  const portalStyle: React.CSSProperties = {
    position: "fixed",
    left: triggerRect.left,
    width: triggerRect.width,
    zIndex: 9999,
    ...(shouldDropUp
      ? { bottom: window.innerHeight - triggerRect.top + 8 }
      : { top: triggerRect.bottom + 8 }),
  };

  return createPortal(
    <div
      ref={dropdownRef}
      style={portalStyle}
      className="bg-surface-card border border-border rounded-2xl shadow-xl shadow-black/20 p-3 animate-fade-in"
      onKeyDown={handleKeyDown}
    >
      <div className={`${sizeClasses[size]} overflow-y-auto flex flex-col gap-1`}>
        {filteredOptions.length === 0 ? (
          <div className="py-8 text-center text-text-muted text-sm">No options found</div>
        ) : (
          filteredOptions.map((option, index) => {
            const isSelected = option.value === selectedValue;
            return (
              <div
                key={option.value}
                onClick={() => !option.disabled && selectOption(option.value)}
                className={`
                  flex items-center justify-between gap-3 cursor-pointer
                  ${optionSizeClasses[size]}
                  ${isSelected
                    ? "bg-primary/10 text-primary font-semibold hover:bg-primary/10"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                  }
                  ${option.disabled ? "opacity-40 cursor-not-allowed" : ""}
                  transition-colors duration-150
                  ${focusedIndex === index && !isSelected ? "bg-surface-hover text-text-primary" : ""}
                `}
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  {option.icon && <span className="shrink-0 text-text-muted">{option.icon}</span>}
                  <span className="truncate">{option.label}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 shrink-0 text-primary" />}
              </div>
            );
          })
        )}
      </div>
    </div>,
    document.body
  );
};

// ============================================
// Option (for declarative usage)
// ============================================

interface SelectOptionProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
  icon?: React.ReactNode;
}

const SelectOptionComponent = ({ value, children, disabled, icon }: SelectOptionProps) => {
  return null;
};

// ============================================
// Main Component
// ============================================

export const CustomSelect = ({
  options = [],
  value,
  onChange,
  placeholder = "Select an option",
  disabled = false,
  hasError = false,
  size = "md",
  className = "",
  searchable = false,
  clearable = false,
  required = false,
  name,
}: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string | undefined>(value);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  // Capture trigger position when opening so the portal can position itself
  useLayoutEffect(() => {
    if (!isOpen || !wrapperRef.current) return;
    setTriggerRect(wrapperRef.current.getBoundingClientRect());
  }, [isOpen]);

  const selectOption = (newValue: string) => {
    setSelectedValue(newValue);
    onChange?.(newValue);
    setIsOpen(false);
  };

  const clearSelection = () => {
    setSelectedValue(undefined);
    onChange?.("");
  };

  const selectedOption = options.find((opt) => opt.value === selectedValue);

  const contextValue: SelectContextValue = {
    isOpen,
    setIsOpen,
    selectedValue,
    selectOption,
    clearSelection,
    size,
    disabled,
    hasError,
    searchable,
    clearable,
    placeholder,
    wrapperRef,
    triggerRect,
  };

  return (
    <SelectContext.Provider value={contextValue}>
      <div ref={wrapperRef} className={`relative ${className}`}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          name={name}
          className={`
            w-full flex items-center justify-between gap-2
            border outline-none transition-all duration-200 font-sans
            ${size === "sm" ? "px-3 py-1.5 text-xs min-h-[36px] rounded-lg" : ""}
            ${size === "md" ? "px-3.5 py-2.5 text-xs min-h-[44px] rounded-xl" : ""}
            ${size === "lg" ? "px-4 py-3 text-sm min-h-[52px] rounded-xl" : ""}
            ${hasError
              ? "border-danger focus:border-danger focus:ring-2 focus:ring-danger/20"
              : "border-border hover:border-border-strong focus:border-primary focus:ring-2 focus:ring-primary/20"
            }
            ${disabled
              ? "opacity-50 cursor-not-allowed bg-surface-hover"
              : "cursor-pointer bg-surface-input"
            }
          `}
        >
          <span className={`flex-1 text-left truncate ${!selectedValue ? "text-text-muted" : ""}`}>
            {selectedOption?.icon ? (
              <span className="inline-flex items-center gap-2">
                <span className="shrink-0">{selectedOption.icon}</span>
                <span>{selectedOption.label}</span>
              </span>
            ) : (
              selectedOption?.label || placeholder
            )}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            {clearable && selectedValue && !disabled && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); clearSelection(); }}
                className="p-1 rounded-md hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors"
                tabIndex={-1}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <ChevronDown
              className={`w-4 h-4 text-text-muted transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            />
          </div>
        </button>

        <SelectDropdown options={options} />
      </div>
    </SelectContext.Provider>
  );
};

// Export sub-components for composability
CustomSelect.Trigger = SelectTrigger;
CustomSelect.Dropdown = SelectDropdown;
CustomSelect.Option = SelectOptionComponent;

export default CustomSelect;

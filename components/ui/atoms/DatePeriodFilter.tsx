"use client";

import React, { useState, useRef, useEffect } from "react";
import { Calendar, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/atoms/Button";

export interface DatePeriodOption {
  value: string;
  label: string;
}

interface DatePeriodFilterProps {
  value: string;
  onChange: (value: string) => void;
  customStartDate: string;
  setCustomStartDate: (value: string) => void;
  customEndDate: string;
  setCustomEndDate: (value: string) => void;
  options: DatePeriodOption[];
  placeholder?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const DatePeriodFilter = ({
  value,
  onChange,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  options,
  placeholder = "Pilih Tanggal",
  size = "sm",
  className = "",
}: DatePeriodFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dateError, setDateError] = useState<string>("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Max 1 year validation
  const MAX_YEAR_DIFF = 365; // days in a year (approximate)

  const validateDateRange = (start: string, end: string) => {
    if (!start || !end) {
      setDateError("");
      return true;
    }

    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > MAX_YEAR_DIFF) {
      setDateError("Maksimal range tanggal adalah 1 tahun");
      return false;
    }

    if (diffDays < 0) {
      setDateError("Tanggal selesai harus lebih besar dari tanggal mulai");
      return false;
    }

    setDateError("");
    return true;
  };

  const handleStartDateChange = (newValue: string) => {
    setCustomStartDate(newValue);
    if (customEndDate) {
      validateDateRange(newValue, customEndDate);
    } else {
      setDateError("");
    }
  };

  const handleEndDateChange = (newValue: string) => {
    // Calculate max allowed start date (1 year before end date)
    if (customStartDate) {
      const endDate = new Date(newValue);
      const maxStartDate = new Date(endDate);
      maxStartDate.setFullYear(maxStartDate.getFullYear() - 1);

      const startDate = new Date(customStartDate);
      if (startDate < maxStartDate) {
        // Adjust start date to be within 1 year range
        const adjustedStart = getLocalDateString(maxStartDate);
        setCustomStartDate(adjustedStart);
        setDateError("");
        setCustomEndDate(newValue);
        return;
      }
    }

    setCustomEndDate(newValue);
    validateDateRange(customStartDate, newValue);
  };

  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const formatCompactDate = (dateStr: string) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    const [year, month, day] = parts;
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
    const monthIndex = parseInt(month) - 1;
    const monthLabel = months[monthIndex] || month;
    return `${day} ${monthLabel} ${year}`;
  };

  const getDisplayValue = () => {
    if (value === "custom") {
      if (customStartDate && customEndDate) {
        return `${formatCompactDate(customStartDate)} - ${formatCompactDate(customEndDate)}`;
      }
      return "Custom Tanggal";
    }
    const matched = options.find((opt) => opt.value === value);
    return matched ? matched.label : placeholder;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between gap-2
          border border-border hover:border-border-strong outline-none transition-all duration-150 ease font-sans
          bg-surface-input focus:border-border-focus cursor-pointer
          ${size === "sm" ? "px-3 py-1.5 text-xs h-10 rounded-xl" : ""}
          ${size === "md" ? "px-3 py-2 text-sm min-h-[44px] rounded-xl" : ""}
          ${size === "lg" ? "px-4 py-2.5 text-sm min-h-[52px] rounded-xl" : ""}
        `}
      >
        <span className="flex-grow text-left truncate inline-flex items-center gap-2">
          <Calendar className="w-4 h-4 text-text-muted shrink-0" />
          <span className="truncate text-text-primary font-medium">{getDisplayValue()}</span>
        </span>
        <ChevronDown
          className={`w-4 h-4 text-text-muted transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          className={`
            absolute z-50 w-72 mt-2
            bg-surface-card border border-border rounded-lg
            p-3
            animate-fade-in
            ${size === "sm" ? "left-0" : "right-0 md:left-0"}
          `}
        >
          <div className="flex flex-col gap-1">
            {options.map((opt) => {
              const isActive = value === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    if (opt.value !== "custom") {
                      setDateError("");
                      setIsOpen(false);
                    }
                  }}
                  className={`
                    flex items-center justify-between gap-3 cursor-pointer w-full text-left
                    ${size === "sm" ? "py-1.5 px-3 text-xs rounded-md" : "py-2 px-3 text-sm rounded-md"}
                    ${isActive
                      ? "bg-primary/10 text-primary font-semibold hover:text-primary hover:bg-primary/10"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                    }
                    transition-colors duration-150 ease
                  `}
                >
                  <span>{opt.label}</span>
                  {isActive && <Check className="w-4 h-4 shrink-0 text-primary" />}
                </button>
              );
            })}
          </div>

          {value === "custom" && (
            <div className="pt-3 border-t border-border/50 space-y-3 animate-fade-in">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">Mulai</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    max={customEndDate}
                    className={`w-full px-2 bg-surface-input border focus:border-border-focus rounded-md text-text-primary text-[11px] outline-none transition-all duration-150 ease cursor-pointer h-8 ${
                      dateError ? "border-feedback-error" : "border-border"
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">Selesai</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => handleEndDateChange(e.target.value)}
                    min={customStartDate}
                    className={`w-full px-2 bg-surface-input border focus:border-border-focus rounded-md text-text-primary text-[11px] outline-none transition-all duration-150 ease cursor-pointer h-8 ${
                      dateError ? "border-feedback-error" : "border-border"
                    }`}
                  />
                </div>
              </div>
              {dateError && (
                <p className="text-[10px] text-feedback-error font-medium">{dateError}</p>
              )}
              <Button
                variant="primary"
                size="sm"
                className="w-full h-8 min-h-[32px] text-xs"
                onClick={() => setIsOpen(false)}
                disabled={!!dateError}
              >
                Terapkan
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

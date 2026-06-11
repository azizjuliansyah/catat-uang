"use client";

import React, { useState, useEffect, useRef } from "react";
import { Calendar, ChevronDown, Check, BarChart4, Table } from "lucide-react";
import { Button } from "@/components/ui/atoms/Button";
import { TabButton } from "@/components/ui/molecules/TabButton";

type PeriodFilterType = "this_month" | "last_3_months" | "last_6_months" | "this_year" | "custom";

interface PeriodFilterProps {
  periodFilter: PeriodFilterType;
  setPeriodFilter: (filter: PeriodFilterType) => void;
  customStartDate: string;
  setCustomStartDate: (date: string) => void;
  customEndDate: string;
  setCustomEndDate: (date: string) => void;
  viewMode: "visual" | "tabular";
  setViewMode: (mode: "visual" | "tabular") => void;
}

export function PeriodFilter({
  periodFilter,
  setPeriodFilter,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  viewMode,
  setViewMode
}: PeriodFilterProps) {
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowPeriodDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const periodLabels: Record<PeriodFilterType, string> = {
    this_month: "Bulan Ini",
    last_3_months: "3 Bulan Terakhir",
    last_6_months: "6 Bulan Terakhir",
    this_year: "Tahun Ini",
    custom: "Custom Tanggal"
  };

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

  const getDropdownLabel = () => {
    if (periodFilter === "custom") {
      if (customStartDate && customEndDate) {
        return `${formatCompactDate(customStartDate)} - ${formatCompactDate(customEndDate)}`;
      }
      return "Custom Tanggal";
    }
    return periodLabels[periodFilter];
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-surface-card border border-border p-4 rounded-2xl shadow-sm">
      {/* Date Dropdown */}
      <div className="relative w-full sm:w-56 shrink-0" ref={dropdownRef}>
        <Button
          variant="secondary"
          onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
          className="w-full flex items-center justify-between pl-9 pr-3 bg-surface-input border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-text-primary text-xs outline-none transition-all cursor-pointer focus-glow h-10 select-none font-medium min-h-0"
        >
          <Calendar className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <span className="truncate text-left">{getDropdownLabel()}</span>
          <ChevronDown className={`w-3.5 h-3.5 text-text-secondary transition-transform duration-200 shrink-0 ml-1 ${showPeriodDropdown ? "rotate-180" : ""}`} />
        </Button>
 
        {showPeriodDropdown && (
          <div className="absolute left-0 mt-2 w-72 bg-surface-card border border-border rounded-2xl shadow-xl p-3 z-50 animate-fade-in space-y-3">
            <div className="flex flex-col gap-1">
              {(["this_month", "last_3_months", "last_6_months", "this_year", "custom"] as PeriodFilterType[]).map((filter) => {
                const isActive = periodFilter === filter;
                return (
                  <Button
                    key={filter}
                    variant="ghost"
                    onClick={() => {
                      setPeriodFilter(filter);
                      if (filter !== "custom") {
                        setShowPeriodDropdown(false);
                      }
                    }}
                    className={`flex items-center justify-between w-full px-3 py-2 text-left text-xs rounded-xl transition-colors min-h-0 h-auto font-normal ${
                      isActive
                        ? "bg-primary/10 text-primary font-semibold hover:text-primary hover:bg-primary/10"
                        : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                    }`}
                  >
                    <span>{periodLabels[filter]}</span>
                    {isActive && <Check className="w-3.5 h-3.5" />}
                  </Button>
                );
              })}
            </div>

            {periodFilter === "custom" && (
              <div className="pt-3 border-t border-border/50 space-y-3 animate-fade-in">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">Mulai</label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full px-2 bg-surface-input border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-text-primary text-[11px] outline-none transition-all cursor-pointer focus-glow h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">Selesai</label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full px-2 bg-surface-input border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-text-primary text-[11px] outline-none transition-all cursor-pointer focus-glow h-8"
                    />
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full h-8 min-h-[32px] text-xs"
                  onClick={() => setShowPeriodDropdown(false)}
                >
                  Terapkan
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* View Mode Toggle */}
      <div className="bg-surface-hover/30 border border-border p-1 rounded-xl flex gap-1 h-10 items-center self-stretch sm:self-auto">
        <TabButton
          isActive={viewMode === "visual"}
          onClick={() => setViewMode("visual")}
          className="flex-1 sm:flex-none px-4 py-0 h-full text-xs rounded-lg whitespace-nowrap"
        >
          <BarChart4 className="w-3.5 h-3.5 mr-1.5 inline" />
          Grafik
        </TabButton>
        <TabButton
          isActive={viewMode === "tabular"}
          onClick={() => setViewMode("tabular")}
          className="flex-1 sm:flex-none px-4 py-0 h-full text-xs rounded-lg whitespace-nowrap"
        >
          <Table className="w-3.5 h-3.5 mr-1.5 inline" />
          Tabular
        </TabButton>
      </div>
    </div>
  );
}

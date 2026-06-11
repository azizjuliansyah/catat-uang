"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Calendar, SlidersHorizontal, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/atoms/Button";
import { TabButton } from "@/components/ui/molecules/TabButton";

interface Wallet {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
}

interface TransactionsFiltersProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  dateRangeType: string;
  setDateRangeType: (val: string) => void;
  customStartDate: string;
  setCustomStartDate: (val: string) => void;
  customEndDate: string;
  setCustomEndDate: (val: string) => void;
  showFilters: boolean;
  setShowFilters: (val: boolean) => void;
  selectedType: "all" | "income" | "expense";
  setSelectedType: (val: "all" | "income" | "expense") => void;
  selectedWalletId: string;
  setSelectedWalletId: (val: string) => void;
  selectedCategoryId: string;
  setSelectedCategoryId: (val: string) => void;
  wallets: Wallet[];
  categories: Category[];
}

export function TransactionsFilters({
  searchTerm,
  setSearchTerm,
  dateRangeType,
  setDateRangeType,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  showFilters,
  setShowFilters,
  selectedType,
  setSelectedType,
  selectedWalletId,
  setSelectedWalletId,
  selectedCategoryId,
  setSelectedCategoryId,
  wallets,
  categories
}: TransactionsFiltersProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    switch (dateRangeType) {
      case "1week":
        return "Satu Minggu yang Lalu";
      case "2weeks":
        return "Dua Minggu yang Lalu";
      case "1month":
        return "Sebulan yang Lalu";
      case "3months":
        return "3 Bulan yang Lalu";
      case "custom":
        return `${formatCompactDate(customStartDate)} - ${formatCompactDate(customEndDate)}`;
      default:
        return "Pilih Tanggal";
    }
  };

  return (
    <div className="bg-surface-card border border-border rounded-2xl p-4 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari deskripsi atau kategori..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-surface-input border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-text-primary text-xs outline-none transition-all focus-glow"
          />
        </div>

        {/* Date Selector Custom Dropdown */}
        <div className="relative w-full sm:w-56 shrink-0" ref={dropdownRef}>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center pl-9 pr-3 bg-surface-input border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-text-primary text-xs outline-none transition-all cursor-pointer focus-glow h-10 select-none !justify-between min-h-0"
          >
            <Calendar className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <span className="truncate font-medium text-left">
              {getDropdownLabel()}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-text-secondary transition-transform duration-200 shrink-0 ml-1 ${isDropdownOpen ? "rotate-180" : ""}`} />
          </Button>

          {isDropdownOpen && (
            <div className="absolute right-0 sm:left-0 mt-2 w-72 bg-surface-card border border-border rounded-2xl shadow-xl p-3 z-50 animate-fade-in space-y-3">
              <div className="flex flex-col gap-1">
                {[
                  { value: "1week", label: "Satu Minggu yang Lalu" },
                  { value: "2weeks", label: "Dua Minggu yang Lalu" },
                  { value: "1month", label: "Sebulan yang Lalu" },
                  { value: "3months", label: "3 Bulan yang Lalu" },
                  { value: "custom", label: "Custom Tanggal" }
                ].map((opt) => {
                  const isActive = dateRangeType === opt.value;
                  return (
                    <Button
                      key={opt.value}
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setDateRangeType(opt.value);
                        if (opt.value !== "custom") {
                          setIsDropdownOpen(false);
                        }
                      }}
                      className={`w-full px-3 py-2 text-left text-xs rounded-xl min-h-0 h-auto font-normal !justify-between ${
                        isActive
                          ? "bg-primary/10 text-primary font-semibold hover:bg-primary/15 hover:text-primary"
                          : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isActive && <Check className="w-3.5 h-3.5" />}
                    </Button>
                  );
                })}
              </div>

              {dateRangeType === "custom" && (
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
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Terapkan
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Filter toggle */}
        <Button
          variant={showFilters ? "primary" : "secondary"}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="sm:w-auto"
        >
          <SlidersHorizontal className="w-4 h-4 mr-1.5" />
          Filter
        </Button>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border/50 animate-fade-in">
          {/* Type Filter */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Jenis Transaksi</label>
            <div className="flex bg-surface-hover/30 p-1 border border-border rounded-xl h-10 items-center">
              <TabButton
                isActive={selectedType === "all"}
                onClick={() => setSelectedType("all")}
                className="flex-1 py-0 h-full text-xs rounded-lg"
              >
                Semua
              </TabButton>
              <TabButton
                isActive={selectedType === "income"}
                onClick={() => setSelectedType("income")}
                className="flex-1 py-0 h-full text-xs rounded-lg"
              >
                Masuk
              </TabButton>
              <TabButton
                isActive={selectedType === "expense"}
                onClick={() => setSelectedType("expense")}
                className="flex-1 py-0 h-full text-xs rounded-lg"
              >
                Keluar
              </TabButton>
            </div>
          </div>

          {/* Wallet Filter */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Dompet</label>
            <select
              value={selectedWalletId}
              onChange={(e) => setSelectedWalletId(e.target.value)}
              className="w-full px-3 h-10 bg-surface-input border border-border rounded-xl text-text-primary text-xs outline-none focus:border-primary cursor-pointer focus-glow"
            >
              <option value="all">Semua Dompet</option>
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Kategori</label>
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full px-3 h-10 bg-surface-input border border-border rounded-xl text-text-primary text-xs outline-none focus:border-primary cursor-pointer focus-glow"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type === "expense" ? "Keluar" : "Masuk"})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

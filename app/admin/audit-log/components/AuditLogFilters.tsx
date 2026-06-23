"use client";

import React from "react";
import { SearchInput } from "@/components/ui/atoms/SearchInput";
import { DatePeriodFilter, DatePeriodOption } from "@/components/ui/atoms/DatePeriodFilter";
import CustomSelect from "@/components/ui/atoms/CustomSelect";

interface AdminUser {
  id: string;
  email: string;
}

interface AuditLogFiltersProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  actionFilter: string;
  setActionFilter: (val: string) => void;
  adminFilter: string;
  setAdminFilter: (val: string) => void;
  datePeriod: string;
  setDatePeriod: (val: string) => void;
  customStartDate: string;
  setCustomStartDate: (val: string) => void;
  customEndDate: string;
  setCustomEndDate: (val: string) => void;
  adminUsers: AdminUser[];
  uniqueActions: string[];
  formatActionLabel: (action: string) => string;
  getActionIcon: (action: string) => React.ReactNode;
}

export function AuditLogFilters({
  searchTerm,
  setSearchTerm,
  actionFilter,
  setActionFilter,
  adminFilter,
  setAdminFilter,
  datePeriod,
  setDatePeriod,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  adminUsers,
  uniqueActions,
  formatActionLabel,
  getActionIcon
}: AuditLogFiltersProps) {
  // Build options for action filter
  const actionOptions = [
    { value: "all", label: "Semua Aksi" },
    ...uniqueActions.map((action) => ({
      value: action,
      label: formatActionLabel(action),
    })),
  ];

  // Build options for admin filter
  const adminOptions = [
    { value: "all", label: "Semua Admin" },
    ...adminUsers.map((admin) => ({
      value: admin.id,
      label: admin.email,
    })),
  ];

  // Build options for date period filter
  const datePeriodOptions: DatePeriodOption[] = [
    { value: "all", label: "Semua Tanggal" },
    { value: "7d", label: "7 Hari Terakhir" },
    { value: "30d", label: "30 Hari Terakhir" },
    { value: "90d", label: "90 Hari Terakhir" },
    { value: "custom", label: "Custom Tanggal" },
  ];

  return (
    <div className="bg-surface-card border border-border rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center flex-1 gap-3">
        {/* Search */}
        <SearchInput
          placeholder="Cari aksi, email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          showClearButton={!!searchTerm}
          onClear={() => setSearchTerm("")}
        />

        {/* Action Filter */}
        <div className="w-full sm:w-48 shrink-0">
          <CustomSelect
            options={actionOptions}
            value={actionFilter}
            onChange={(val) => setActionFilter(val || "all")}
            placeholder="Semua Aksi"
            size="sm"
          />
        </div>

        {/* Admin Filter - always render, options populate when data arrives */}
        <div className="w-full sm:w-48 shrink-0">
          <CustomSelect
            options={adminOptions}
            value={adminFilter}
            onChange={(val) => setAdminFilter(val || "all")}
            placeholder="Semua Admin"
            size="sm"
          />
        </div>
      </div>

      {/* Date Period Filter */}
      <div className="w-full lg:w-48 shrink-0">
        <DatePeriodFilter
          value={datePeriod}
          onChange={setDatePeriod}
          customStartDate={customStartDate}
          setCustomStartDate={setCustomStartDate}
          customEndDate={customEndDate}
          setCustomEndDate={setCustomEndDate}
          options={datePeriodOptions}
          placeholder="Semua Tanggal"
          size="sm"
        />
      </div>
    </div>
  );
}

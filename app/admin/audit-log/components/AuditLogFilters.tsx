"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Filter, Calendar, User, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/atoms/Button";

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
  startDate: string;
  setStartDate: (val: string) => void;
  endDate: string;
  setEndDate: (val: string) => void;
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
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  adminUsers,
  uniqueActions,
  formatActionLabel,
  getActionIcon
}: AuditLogFiltersProps) {
  const [actionDropdownOpen, setActionDropdownOpen] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const actionRef = useRef<HTMLDivElement>(null);
  const adminRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (actionRef.current && !actionRef.current.contains(event.target as Node)) {
        setActionDropdownOpen(false);
      }
      if (adminRef.current && !adminRef.current.contains(event.target as Node)) {
        setAdminDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-surface-card border border-border rounded-2xl p-4 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 font-sans">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center flex-1 gap-3">
        {/* Search */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari aksi, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 bg-surface-input border border-border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none rounded-xl text-xs text-text-primary transition-all focus-glow h-10"
          />
        </div>

        {/* Action Filter Dropdown */}
        <div className="relative w-full sm:w-48 shrink-0" ref={actionRef}>
          <Button
            variant="ghost"
            onClick={() => {
              setActionDropdownOpen(!actionDropdownOpen);
              setAdminDropdownOpen(false);
            }}
            className="w-full flex items-center justify-between pl-9 pr-3 bg-surface-input border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-text-primary text-xs outline-none transition-all cursor-pointer focus-glow h-10 select-none font-medium min-h-0"
          >
            <Filter className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <span className="truncate text-left">
              {actionFilter === "all" ? "Semua Aksi" : formatActionLabel(actionFilter)}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-text-secondary transition-transform duration-200 shrink-0 ml-1 ${actionDropdownOpen ? "rotate-180" : ""}`} />
          </Button>

          {actionDropdownOpen && (
            <div className="absolute left-0 mt-2 w-56 bg-surface-card border border-border rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto p-1.5 space-y-0.5">
              <Button
                variant="ghost"
                onClick={() => {
                  setActionFilter("all");
                  setActionDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs rounded-lg transition-colors min-h-0 h-auto ${
                  actionFilter === "all"
                    ? "bg-primary/10 text-primary font-semibold hover:bg-primary/15 hover:text-primary"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                }`}
              >
                <span>Semua Aksi</span>
                {actionFilter === "all" && <Check className="w-3.5 h-3.5" />}
              </Button>
              {uniqueActions.map((action) => {
                const isActive = actionFilter === action;
                return (
                  <Button
                    key={action}
                    variant="ghost"
                    onClick={() => {
                      setActionFilter(action);
                      setActionDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs rounded-lg transition-colors min-h-0 h-auto ${
                      isActive
                        ? "bg-primary/10 text-primary font-semibold hover:bg-primary/15 hover:text-primary"
                        : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {getActionIcon(action)}
                      <span className="truncate">{formatActionLabel(action)}</span>
                    </div>
                    {isActive && <Check className="w-3.5 h-3.5 shrink-0" />}
                  </Button>
                );
              })}
            </div>
          )}
        </div>

        {/* Admin Filter Dropdown */}
        {adminUsers.length > 0 && (
          <div className="relative w-full sm:w-48 shrink-0" ref={adminRef}>
            <Button
              variant="ghost"
              onClick={() => {
                setAdminDropdownOpen(!adminDropdownOpen);
                setActionDropdownOpen(false);
              }}
              className="w-full flex items-center justify-between pl-9 pr-3 bg-surface-input border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-text-primary text-xs outline-none transition-all cursor-pointer focus-glow h-10 select-none font-medium min-h-0"
            >
              <User className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <span className="truncate text-left">
                {adminFilter === "all" ? "Semua Admin" : adminUsers.find(u => u.id === adminFilter)?.email || "Admin"}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-text-secondary transition-transform duration-200 shrink-0 ml-1 ${adminDropdownOpen ? "rotate-180" : ""}`} />
            </Button>

            {adminDropdownOpen && (
              <div className="absolute left-0 mt-2 w-56 bg-surface-card border border-border rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto p-1.5 space-y-0.5">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setAdminFilter("all");
                    setAdminDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs rounded-lg transition-colors min-h-0 h-auto ${
                    adminFilter === "all"
                      ? "bg-primary/10 text-primary font-semibold hover:bg-primary/15 hover:text-primary"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                  }`}
                >
                  <span>Semua Admin</span>
                  {adminFilter === "all" && <Check className="w-3.5 h-3.5" />}
                </Button>
                {adminUsers.map((admin) => {
                  const isActive = adminFilter === admin.id;
                  return (
                    <Button
                      key={admin.id}
                      variant="ghost"
                      onClick={() => {
                        setAdminFilter(admin.id);
                        setAdminDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs rounded-lg transition-colors min-h-0 h-auto ${
                        isActive
                          ? "bg-primary/10 text-primary font-semibold hover:bg-primary/15 hover:text-primary"
                          : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                      }`}
                    >
                      <span className="truncate">{admin.email}</span>
                      {isActive && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Date Range */}
      <div className="flex items-center gap-2 w-full lg:w-auto shrink-0">
        <div className="flex items-center justify-between px-3 bg-surface-input border border-border focus-within:border-primary focus-within:ring-1 focus-within:ring-primary rounded-xl h-10 w-full lg:w-auto gap-2">
          <Calendar className="w-4 h-4 text-text-secondary shrink-0" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-transparent text-xs text-text-primary focus:outline-none cursor-pointer h-full outline-none border-none py-0 w-28 shrink-0"
          />
          <span className="text-text-secondary text-xs shrink-0">—</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-transparent text-xs text-text-primary focus:outline-none cursor-pointer h-full outline-none border-none py-0 w-28 shrink-0"
          />
        </div>
      </div>
    </div>
  );
}

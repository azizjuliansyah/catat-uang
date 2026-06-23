import { useState } from "react";
import { formatActionLabel, getActionIconName as getActionIcon, getActionColor } from "../utils";

export interface AuditLog {
  id: string;
  actor_id: string;
  action: string;
  target_type: string;
  target_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
  actor_user?: {
    email: string;
    name: string | null;
  } | null;
}

export interface AdminUser {
  id: string;
  email: string;
}

export function useAuditLogState() {
  // Data states
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [adminFilter, setAdminFilter] = useState("all");
  const [datePeriod, setDatePeriod] = useState("all"); // all, 7d, 30d, 90d, custom
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  // Pagination states
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Get unique actions from logs
  const uniqueActions = Array.from(new Set(logs.map((log) => log.action))).sort();

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      searchTerm === "" ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.actor_user?.email && log.actor_user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.details?.email && String(log.details.email).toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesAction = actionFilter === "all" || log.action === actionFilter;

    const matchesAdmin = adminFilter === "all" || log.actor_id === adminFilter;

    // Date period filtering
    let matchesDateRange = true;
    if (datePeriod !== "all") {
      const logDate = new Date(log.created_at);
      const now = new Date();

      if (datePeriod === "custom") {
        // Use custom date range
        if (customStartDate) {
          matchesDateRange = matchesDateRange && logDate >= new Date(customStartDate);
        }
        if (customEndDate) {
          const endDateObj = new Date(customEndDate);
          endDateObj.setHours(23, 59, 59);
          matchesDateRange = matchesDateRange && logDate <= endDateObj;
        }
      } else {
        // Calculate based on period
        const days = parseInt(datePeriod) || 0;
        const startDate = new Date(now);
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);
        matchesDateRange = logDate >= startDate;
      }
    }

    return matchesSearch && matchesAction && matchesAdmin && matchesDateRange;
  });

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / pageSize);
  const paginatedLogs = filteredLogs.slice((page - 1) * pageSize, page * pageSize);

  return {
    // Data
    logs,
    setLogs,
    loading,
    setLoading,
    adminUsers,
    setAdminUsers,

    // Filters
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

    // Pagination
    page,
    setPage,
    pageSize,
    totalPages,
    paginatedLogs,
    filteredLogs,
    filteredLogsCount: filteredLogs.length,

    // Derived
    uniqueActions,

    // Utilities
    formatActionLabel,
    getActionIcon,
    getActionColor,
  };
}

"use client";

import { useState, useEffect } from "react";
import { getAuditLogs, getAdminUsers } from "@/app/admin/actions";
import { FileText, Shield, User, Check, AlertCircle } from "lucide-react";
import { AuditLogFilters } from "./components/AuditLogFilters";
import { AuditLogStats } from "./components/AuditLogStats";
import { AuditLogTable } from "./components/AuditLogTable";

interface AuditLog {
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

interface AdminUser {
  id: string;
  email: string;
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [adminFilter, setAdminFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 20;

  async function fetchLogs() {
    try {
      setLoading(true);
      const data = await getAuditLogs();
      setLogs((data as unknown as AuditLog[]) || []);
    } catch (err: unknown) {
      console.error("Error fetching audit logs:", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAdminUsers() {
    try {
      const data = await getAdminUsers();
      setAdminUsers((data as unknown as AdminUser[]) || []);
    } catch (err: unknown) {
      console.error("Error fetching admin users:", err);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    Promise.all([fetchLogs(), fetchAdminUsers()]);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [searchTerm, actionFilter, adminFilter, startDate, endDate]);

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

    let matchesDateRange = true;
    if (startDate) {
      matchesDateRange = matchesDateRange && new Date(log.created_at) >= new Date(startDate);
    }
    if (endDate) {
      const endDateObj = new Date(endDate);
      endDateObj.setHours(23, 59, 59);
      matchesDateRange = matchesDateRange && new Date(log.created_at) <= endDateObj;
    }

    return matchesSearch && matchesAction && matchesAdmin && matchesDateRange;
  });

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / pageSize);
  const paginatedLogs = filteredLogs.slice((page - 1) * pageSize, page * pageSize);

  const formatActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      create_user: "Membuat Pengguna",
      suspend_user: "Menangguhkan Pengguna",
      unsuspend_user: "Mengaktifkan Pengguna",
      delete_user: "Menghapus Pengguna",
      reset_password: "Reset Password"
    };
    return labels[action] || action;
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "create_user":
        return <User className="w-4 h-4 text-success" />;
      case "suspend_user":
        return <Shield className="w-4 h-4 text-warning" />;
      case "unsuspend_user":
        return <Check className="w-4 h-4 text-success" />;
      case "delete_user":
        return <AlertCircle className="w-4 h-4 text-danger" />;
      case "reset_password":
        return <FileText className="w-4 h-4 text-primary" />;
      default:
        return <FileText className="w-4 h-4 text-text-secondary" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "create_user":
        return "bg-success/10 text-success";
      case "suspend_user":
        return "bg-warning/10 text-warning";
      case "unsuspend_user":
        return "bg-success/10 text-success";
      case "delete_user":
        return "bg-danger/10 text-danger";
      case "reset_password":
        return "bg-primary/10 text-primary";
      default:
        return "bg-surface-input text-text-secondary";
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight font-display">Audit Log Sistem</h1>
          <p className="text-xs text-text-secondary mt-1 font-medium">Riwayat semua tindakan admin yang dilakukan dalam sistem.</p>
        </div>
      </div>

      {/* Filters */}
      <AuditLogFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        actionFilter={actionFilter}
        setActionFilter={setActionFilter}
        adminFilter={adminFilter}
        setAdminFilter={setAdminFilter}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        adminUsers={adminUsers}
        uniqueActions={uniqueActions}
        formatActionLabel={formatActionLabel}
        getActionIcon={getActionIcon}
      />

      {/* Summary Stats Cards */}
      <AuditLogStats filteredLogs={filteredLogs} />

      {/* Audit Log Table */}
      <div className="bg-surface-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <AuditLogTable
          loading={loading}
          filteredLogsCount={filteredLogs.length}
          paginatedLogs={paginatedLogs}
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          totalPages={totalPages}
          searchTerm={searchTerm}
          actionFilter={actionFilter}
          adminFilter={adminFilter}
          startDate={startDate}
          endDate={endDate}
          getActionIcon={getActionIcon}
          getActionColor={getActionColor}
          formatActionLabel={formatActionLabel}
        />
      </div>
    </div>
  );
}

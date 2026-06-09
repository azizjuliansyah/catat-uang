"use client";

import { useState, useEffect } from "react";
import { getAuditLogs, getAdminUsers } from "@/app/admin/actions";
import {
  FileText,
  Search,
  Filter,
  Calendar,
  User,
  Shield,
  Check,
  AlertCircle,
  ChevronDown
} from "lucide-react";

interface AuditLog {
  id: string;
  actor_id: string;
  action: string;
  target_type: string;
  target_id: string | null;
  details: Record<string, any>;
  created_at: string;
  actor_user?: {
    email: string;
    name: string | null;
  } | null;
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [adminFilter, setAdminFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Dropdown states
  const [actionDropdownOpen, setActionDropdownOpen] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);

  useEffect(() => {
    Promise.all([fetchLogs(), fetchAdminUsers()]);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, actionFilter, adminFilter, startDate, endDate]);

  async function fetchLogs() {
    try {
      setLoading(true);
      const data = await getAuditLogs();
      setLogs(data as AuditLog[]);
    } catch (err: any) {
      console.error("Error fetching audit logs:", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAdminUsers() {
    try {
      const data = await getAdminUsers();
      setAdminUsers(data || []);
    } catch (err: any) {
      console.error("Error fetching admin users:", err);
    }
  }

  // Get unique actions from logs
  const uniqueActions = Array.from(new Set(logs.map(log => log.action))).sort();

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      searchTerm === "" ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.actor_user?.email && log.actor_user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.details.email && log.details.email.toLowerCase().includes(searchTerm.toLowerCase()));

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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Audit Log Sistem</h1>
          <p className="text-sm text-text-secondary mt-0.5">Riwayat semua tindakan admin yang dilakukan dalam sistem.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari aksi, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-surface-input border border-border focus:border-primary focus:outline-none rounded-xl text-sm text-text-primary font-medium w-64"
            />
          </div>

          {/* Action Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setActionDropdownOpen(!actionDropdownOpen);
                setAdminDropdownOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2 bg-surface-input border border-border hover:border-border-strong rounded-xl text-sm text-text-primary font-medium"
            >
              <Filter className="w-4 h-4 text-text-secondary" />
              {actionFilter === "all" ? "Semua Aksi" : formatActionLabel(actionFilter)}
              <ChevronDown className={`w-4 h-4 text-text-secondary transition-transform ${actionDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {actionDropdownOpen && (
              <div className="absolute top-full mt-2 left-0 w-56 bg-surface-card border border-border rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto">
                <button
                  onClick={() => {
                    setActionFilter("all");
                    setActionDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-surface-hover transition-colors ${
                    actionFilter === "all" ? "bg-primary/10 text-primary" : "text-text-primary"
                  }`}
                >
                  Semua Aksi
                </button>
                {uniqueActions.map((action) => (
                  <button
                    key={action}
                    onClick={() => {
                      setActionFilter(action);
                      setActionDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-surface-hover transition-colors flex items-center gap-2 ${
                      actionFilter === action ? "bg-primary/10 text-primary" : "text-text-primary"
                    }`}
                  >
                    {getActionIcon(action)}
                    {formatActionLabel(action)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Admin Filter Dropdown */}
          {adminUsers.length > 0 && (
            <div className="relative">
              <button
                onClick={() => {
                  setAdminDropdownOpen(!adminDropdownOpen);
                  setActionDropdownOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2 bg-surface-input border border-border hover:border-border-strong rounded-xl text-sm text-text-primary font-medium"
                >
                  <User className="w-4 h-4 text-text-secondary" />
                  {adminFilter === "all" ? "Semua Admin" : adminUsers.find(u => u.id === adminFilter)?.email || "Admin"}
                  <ChevronDown className={`w-4 h-4 text-text-secondary transition-transform ${adminDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {adminDropdownOpen && (
                  <div className="absolute top-full mt-2 left-0 w-56 bg-surface-card border border-border rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto">
                    <button
                      onClick={() => {
                        setAdminFilter("all");
                        setAdminDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-surface-hover transition-colors ${
                        adminFilter === "all" ? "bg-primary/10 text-primary" : "text-text-primary"
                      }`}
                    >
                      Semua Admin
                    </button>
                    {adminUsers.map((admin) => (
                      <button
                        key={admin.id}
                        onClick={() => {
                          setAdminFilter(admin.id);
                          setAdminDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-surface-hover transition-colors ${
                          adminFilter === admin.id ? "bg-primary/10 text-primary" : "text-text-primary"
                        }`}
                      >
                        {admin.email}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

        {/* Date Range */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-surface-input border border-border rounded-xl">
            <Calendar className="w-4 h-4 text-text-secondary" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-sm text-text-primary focus:outline-none"
            />
            <span className="text-text-secondary">—</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-sm text-text-primary focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface-card border border-border rounded-xl p-4">
          <p className="text-xs text-text-secondary">Total Log</p>
          <p className="text-2xl font-bold text-text-primary font-mono mt-1">{filteredLogs.length}</p>
        </div>
        <div className="bg-surface-card border border-border rounded-xl p-4">
          <p className="text-xs text-text-secondary">Buat Pengguna</p>
          <p className="text-2xl font-bold text-success font-mono mt-1">
            {filteredLogs.filter(l => l.action === "create_user").length}
          </p>
        </div>
        <div className="bg-surface-card border border-border rounded-xl p-4">
          <p className="text-xs text-text-secondary">Suspend/Unsuspend</p>
          <p className="text-2xl font-bold text-warning font-mono mt-1">
            {filteredLogs.filter(l => l.action === "suspend_user" || l.action === "unsuspend_user").length}
          </p>
        </div>
        <div className="bg-surface-card border border-border rounded-xl p-4">
          <p className="text-xs text-text-secondary">Hapus Pengguna</p>
          <p className="text-2xl font-bold text-danger font-mono mt-1">
            {filteredLogs.filter(l => l.action === "delete_user").length}
          </p>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-surface-card border border-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 bg-surface-input rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-text-secondary mx-auto mb-3 opacity-50" />
            <h3 className="text-sm font-semibold text-text-primary">Tidak ada log ditemukan</h3>
            <p className="text-xs text-text-secondary mt-1">
              {searchTerm || actionFilter !== "all" || adminFilter !== "all" || startDate || endDate
                ? "Coba ubah filter pencarian Anda."
                : "Belum ada riwayat aksi yang tercatat."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-surface-input text-text-secondary uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 font-medium">Waktu</th>
                  <th className="px-4 py-3 font-medium">Admin</th>
                  <th className="px-4 py-3 font-medium">Aksi</th>
                  <th className="px-4 py-3 font-medium">Target</th>
                  <th className="px-4 py-3 font-medium">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-text-primary">
                {paginatedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-hover transition-colors">
                    <td className="px-4 py-3 text-xs text-text-secondary">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                          {log.actor_user?.email?.[0].toUpperCase() || "?"}
                        </div>
                        <span className="text-xs">{log.actor_user?.email || "Unknown"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                        {getActionIcon(log.action)}
                        {formatActionLabel(log.action)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {log.details.email || log.target_id?.slice(0, 8) + "..."}
                    </td>
                    <td className="px-4 py-3 text-xs text-text-secondary">
                      <div className="max-w-xs truncate">
                        {log.details.name && <span>{log.details.name}</span>}
                        {log.details.new_status && <span>Status: {log.details.new_status}</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filteredLogs.length > pageSize && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-text-secondary">
              Menampilkan {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, filteredLogs.length)} dari {filteredLogs.length} log
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 bg-surface-input hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-xs font-medium text-text-primary transition-colors"
              >
                Sebelumnya
              </button>
              <span className="text-xs text-text-secondary px-2">
                Hal {page} dari {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 bg-surface-input hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-xs font-medium text-text-primary transition-colors"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

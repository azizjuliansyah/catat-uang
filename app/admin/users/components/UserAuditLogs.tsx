"use client";

import { FileText, PieChart, ChevronLeft, ChevronRight } from "lucide-react";

import { AuditLog } from "../[id]/types";

interface UserAuditLogsProps {
  auditLogs: AuditLog[];
  loadingLogs: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  total: number;
}

export function UserAuditLogs({
  auditLogs,
  loadingLogs,
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  total,
}: UserAuditLogsProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
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

  return (
    <div className="bg-surface-card border border-border rounded-2xl font-sans overflow-hidden">
      <div className="p-4 border-b border-border flex items-center gap-2">
        <FileText className="w-4 h-4 text-text-secondary" />
        <h3 className="text-sm font-semibold text-text-primary">Riwayat Aksi (Audit Log)</h3>
      </div>

      {loadingLogs ? (
        <div className="p-4 space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-surface-input rounded-lg animate-pulse" />
          ))}
        </div>
      ) : auditLogs.length === 0 ? (
        <div className="p-8 text-center text-text-secondary">
          <PieChart className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Belum ada riwayat aksi untuk pengguna ini</p>
        </div>
      ) : (
        <>
          <div className="divide-y divide-border">
            {auditLogs.map((log, index) => (
              <div
                key={log.id}
                className="p-4 flex items-start gap-3 hover:bg-surface-hover transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-surface-input flex items-center justify-center text-text-secondary shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">
                    {formatActionLabel(log.action)}
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5 flex items-center gap-2">
                    <span>oleh {log.users?.email || "Admin"}</span>
                    <span>•</span>
                    <span>{formatDate(log.created_at)}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination - Always visible */}
          <div className="p-4 border-t border-border flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs text-text-secondary">Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="px-2 py-1 text-xs bg-surface-input border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="text-xs text-text-secondary">
                {total > 0 ? `${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, total)} dari ${total}` : '0-0 dari 0'}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-text-secondary" />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-medium transition-colors ${
                      currentPage === page
                        ? "bg-primary text-white"
                        : "hover:bg-surface-hover text-text-secondary"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-2 rounded-lg hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-text-secondary" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

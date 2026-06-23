"use client";

import { FileText } from "lucide-react";
import { Button } from "@/components/ui/atoms/Button";
import { AuditLogSkeleton } from "./AuditLogSkeleton";
import { EmptyState } from "@/components/ui/organisms/EmptyState";

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

interface AuditLogTableProps {
  loading: boolean;
  filteredLogsCount: number;
  paginatedLogs: AuditLog[];
  page: number;
  setPage: (val: number | ((p: number) => number)) => void;
  pageSize: number;
  totalPages: number;
  searchTerm: string;
  actionFilter: string;
  adminFilter: string;
  startDate: string;
  endDate: string;
  getActionIcon: (action: string) => React.ReactNode;
  getActionColor: (action: string) => string;
  formatActionLabel: (action: string) => string;
}

export function AuditLogTable({
  loading,
  filteredLogsCount,
  paginatedLogs,
  page,
  setPage,
  pageSize,
  totalPages,
  searchTerm,
  actionFilter,
  adminFilter,
  startDate,
  endDate,
  getActionIcon,
  getActionColor,
  formatActionLabel
}: AuditLogTableProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading) {
    return <AuditLogSkeleton />;
  }

  if (filteredLogsCount === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="Tidak ada log ditemukan"
        description={
          searchTerm || actionFilter !== "all" || adminFilter !== "all" || startDate || endDate
            ? "Coba ubah filter pencarian Anda."
            : "Belum ada riwayat aksi yang tercatat."
        }
      />
    );
  }

  return (
    <div className="font-sans">
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
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                      {log.actor_user?.email?.[0].toUpperCase() || "?"}
                    </div>
                    <span className="text-xs truncate max-w-[120px]">{log.actor_user?.email || "Unknown"}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                    {getActionIcon(log.action)}
                    {formatActionLabel(log.action)}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs truncate max-w-[120px]">
                  {String(log.details?.email || log.target_id || "").slice(0, 24)}
                  {String(log.details?.email || log.target_id || "").length > 24 && "..."}
                </td>
                <td className="px-4 py-3 text-xs text-text-secondary">
                  <div className="max-w-xs truncate">
                    {!!log.details?.name && <span>{String(log.details.name)}</span>}
                    {!!log.details?.new_status && <span>Status: {String(log.details.new_status)}</span>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredLogsCount > pageSize && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-surface-card">
          <p className="text-xs text-text-secondary">
            Menampilkan {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, filteredLogsCount)} dari {filteredLogsCount} log
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 min-h-0 h-auto text-xs font-medium text-text-primary cursor-pointer"
            >
              Sebelumnya
            </Button>
            <span className="text-xs text-text-secondary px-2">
              Hal {page} dari {totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 min-h-0 h-auto text-xs font-medium text-text-primary cursor-pointer"
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

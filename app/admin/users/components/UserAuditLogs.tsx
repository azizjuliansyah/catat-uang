"use client";

import { FileText, PieChart } from "lucide-react";

interface AuditLog {
  id: string;
  actor_id: string;
  action: string;
  details: Record<string, unknown>;
  created_at: string;
  users?: {
    email: string;
  } | null;
}

interface UserAuditLogsProps {
  auditLogs: AuditLog[];
  loadingLogs: boolean;
}

export function UserAuditLogs({ auditLogs, loadingLogs }: UserAuditLogsProps) {
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
    <div className="bg-surface-card border border-border rounded-2xl shadow-sm font-sans">
      <div className="p-4 border-b border-border flex items-center gap-2">
        <FileText className="w-4 h-4 text-text-secondary" />
        <h3 className="text-sm font-semibold text-text-primary">Riwayat Aksi (Audit Log)</h3>
        <span className="text-xs text-text-secondary">• 20 terakhir</span>
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
        <div className="divide-y divide-border">
          {auditLogs.map((log) => (
            <div key={log.id} className="p-4 flex items-start gap-3 hover:bg-surface-hover transition-colors">
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
      )}
    </div>
  );
}

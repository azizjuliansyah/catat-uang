"use client";

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

interface AuditLogStatsProps {
  filteredLogs: AuditLog[];
}

export function AuditLogStats({ filteredLogs }: AuditLogStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-sans">
      <div className="bg-surface-card border border-border rounded-xl p-4 shadow-sm hover:border-border-strong transition-all duration-200">
        <p className="text-xxs font-bold text-text-secondary uppercase tracking-wider">Total Log</p>
        <p className="text-2xl font-bold text-text-primary font-mono mt-1">{filteredLogs.length}</p>
      </div>
      <div className="bg-surface-card border border-border rounded-xl p-4 shadow-sm hover:border-border-strong transition-all duration-200">
        <p className="text-xxs font-bold text-text-secondary uppercase tracking-wider">Buat Pengguna</p>
        <p className="text-2xl font-bold text-success font-mono mt-1">
          {filteredLogs.filter((l) => l.action === "create_user").length}
        </p>
      </div>
      <div className="bg-surface-card border border-border rounded-xl p-4 shadow-sm hover:border-border-strong transition-all duration-200">
        <p className="text-xxs font-bold text-text-secondary uppercase tracking-wider">Suspend/Unsuspend</p>
        <p className="text-2xl font-bold text-warning font-mono mt-1">
          {filteredLogs.filter((l) => l.action === "suspend_user" || l.action === "unsuspend_user").length}
        </p>
      </div>
      <div className="bg-surface-card border border-border rounded-xl p-4 shadow-sm hover:border-border-strong transition-all duration-200">
        <p className="text-xxs font-bold text-text-secondary uppercase tracking-wider">Hapus Pengguna</p>
        <p className="text-2xl font-bold text-danger font-mono mt-1">
          {filteredLogs.filter((l) => l.action === "delete_user").length}
        </p>
      </div>
    </div>
  );
}

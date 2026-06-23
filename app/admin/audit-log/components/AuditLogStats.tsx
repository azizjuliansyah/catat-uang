"use client";

import { InfoCard } from "@/components/ui/molecules/InfoCard";

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
  const createUserCount = filteredLogs.filter((l) => l.action === "create_user").length;
  const suspendCount = filteredLogs.filter((l) => l.action === "suspend_user" || l.action === "unsuspend_user").length;
  const deleteUserCount = filteredLogs.filter((l) => l.action === "delete_user").length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <InfoCard title="Total Log" value={filteredLogs.length} variant="neutral" />
      <InfoCard title="Buat Pengguna" value={createUserCount} variant="success" />
      <InfoCard title="Suspend/Unsuspend" value={suspendCount} variant="warning" />
      <InfoCard title="Hapus Pengguna" value={deleteUserCount} variant="danger" />
    </div>
  );
}

"use client";

import { Layers } from "lucide-react";
import Link from "next/link";

interface AdminAuditLogCardProps {
  userEmail?: string;
}

export function AdminAuditLogCard({ userEmail }: AdminAuditLogCardProps) {
  return (
    <div className="bg-surface-card border border-border rounded-xl p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-warning" />
          <h3 className="font-semibold text-text-primary text-sm">
            Log Audit Sistem
          </h3>
        </div>
        <Link
          href="/admin/audit-log"
          className="text-xxs text-text-secondary hover:underline font-medium"
        >
          Lihat Detail
        </Link>
      </div>
      <div className="border border-border rounded-lg bg-surface-input/50 p-4 font-mono text-xxs text-text-secondary space-y-2 max-h-48 overflow-y-auto">
        <p>[2026-06-08 02:50] - SYSTEM - Database migration 0001 applied</p>
        <p>[2026-06-08 02:52] - ADMIN - Login successful for {userEmail}</p>
      </div>
    </div>
  );
}

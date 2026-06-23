"use client";

export function AuditLogHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight font-display">Audit Log Sistem</h1>
        <p className="text-xs text-text-secondary mt-1 font-medium">Riwayat semua tindakan admin yang dilakukan dalam sistem.</p>
      </div>
    </div>
  );
}

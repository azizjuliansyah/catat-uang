"use client";

import { useApp } from "@/app/providers/AppProvider";
import { Button } from "@/components/ui/atoms/Button";
import { Users, ShieldAlert, Layers } from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
  const { user } = useApp();

  return (
    <div className="space-y-6 font-sans">
      {/* Banner */}
      <div className="bg-warning/5 border border-warning/20 rounded-xl p-6 flex gap-4 items-start">
        <ShieldAlert className="w-6 h-6 text-warning shrink-0 mt-0.5" />
        <div>
          <h2 className="text-sm font-semibold text-warning">
            Privileged Console
          </h2>
          <p className="text-xs text-text-secondary mt-1 leading-relaxed">
            Anda masuk dengan peran Administrator. Konsol ini digunakan untuk memantau aktivitas pengguna, mengelola suspensi akun, dan meninjau audit logs. Fitur manajemen keuangan pribadi dinonaktifkan untuk akun administrator.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Management Section */}
        <div className="bg-surface-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-warning" />
              <h3 className="font-semibold text-text-primary text-sm">
                Kelola Pengguna
              </h3>
            </div>
            <Link
              href="/admin/users"
              className="text-xxs text-text-secondary hover:underline font-medium"
            >
              Lihat Semua
            </Link>
          </div>
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-surface-input text-text-secondary uppercase text-[10px] tracking-wider border-b border-border">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Pengguna</th>
                  <th className="px-4 py-2.5 font-medium">Peran</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-text-primary">
                <tr>
                  <td className="px-4 py-3 font-mono">{user?.email}</td>
                  <td className="px-4 py-3">admin</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-success/15 text-success">
                      aktif
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Logs Section */}
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
            <p>[2026-06-08 02:52] - ADMIN - Login successful for {user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}


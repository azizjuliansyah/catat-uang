"use client";

import { Users } from "lucide-react";
import Link from "next/link";

interface AdminUserCardProps {
  userEmail?: string;
}

export function AdminUserCard({ userEmail }: AdminUserCardProps) {
  return (
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
              <td className="px-4 py-3 font-mono">{userEmail}</td>
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
  );
}

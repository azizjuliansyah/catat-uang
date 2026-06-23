"use client";

import { ShieldAlert } from "lucide-react";

export function AdminBanner() {
  return (
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
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Users, ShieldAlert, LogOut, RefreshCw, Layers } from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.app_metadata?.role !== "admin") {
        router.push("/dashboard");
        return;
      }
      setUser(user);
      setLoading(false);
    }
    loadAdminData();
  }, [supabase, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/auth/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface border-t-4 border-warning">
      {/* Admin Top Bar */}
      <header className="h-16 border-b border-border bg-surface-card flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-warning flex items-center justify-center text-zinc-950 font-bold">
            A
          </div>
          <span className="font-semibold text-text-primary">
            CatatUang <span className="text-warning font-bold">Admin Panel</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-text-secondary font-mono">
            {user?.email}
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-border hover:border-danger rounded-md text-xs font-medium text-text-secondary hover:text-danger hover:bg-danger/10 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Keluar
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 space-y-6">
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
              <button className="text-xxs text-text-secondary hover:underline cursor-pointer">
                Lihat Semua
              </button>
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
              <button className="text-xxs text-text-secondary hover:underline cursor-pointer">
                Refresh Log
              </button>
            </div>
            <div className="border border-border rounded-lg bg-surface-input/50 p-4 font-mono text-xxs text-text-secondary space-y-2 max-h-48 overflow-y-auto">
              <p>[2026-06-08 02:50] - SYSTEM - Database migration 0001 applied</p>
              <p>[2026-06-08 02:52] - ADMIN - Login successful for {user?.email}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/atoms/Button";
import { AlertOctagon, LogOut, Mail, RefreshCw } from "lucide-react";

export default function SuspendedPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.refresh();
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface px-4 relative overflow-hidden select-none">
      {/* Red ambient warning glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-danger/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md space-y-6 z-10 text-center">
        {/* Warning Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-danger/10 border border-danger/20 text-danger mb-2">
          <AlertOctagon className="w-8 h-8" />
        </div>

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Akun Ditangguhkan
          </h1>
          <p className="text-sm text-text-secondary">
            Akses ke akun Anda telah dinonaktifkan sementara oleh administrator sistem.
          </p>
        </div>

        {/* Details Card */}
        <div className="bg-surface-card border border-border rounded-xl p-6 shadow-sm text-left space-y-4">
          <p className="text-sm text-text-secondary leading-relaxed">
            Jika Anda merasa ini adalah kesalahan, atau ingin mengaktifkan kembali akun Anda, silakan hubungi tim administrator CatatUang melalui email di bawah.
          </p>

          <a
            href="mailto:admin@catatuang.id?subject=Permohonan%20Aktivasi%20Akun%20CatatUang"
            className="flex items-center justify-center gap-2 w-full py-2 px-4 border border-border hover:border-border-strong rounded-md text-sm font-medium text-text-primary bg-surface-input hover:bg-surface-hover transition-colors"
          >
            <Mail className="w-4 h-4 text-text-secondary" />
            Hubungi Admin
          </a>
        </div>

        {/* Navigation / Actions */}
        <div className="flex justify-between items-center px-2">
          <Button
            variant="ghost"
            onClick={() => router.refresh()}
            className="flex items-center gap-2 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors min-h-0 h-auto p-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Cek Status
          </Button>

          <Button
            variant="ghost"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-2 text-xs font-medium text-danger hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer min-h-0 h-auto p-0 hover:bg-transparent"
          >
            <LogOut className="w-3.5 h-3.5" />
            {loggingOut ? "Mengeluarkan..." : "Keluar Akun"}
          </Button>
        </div>

        {/* Footer */}
        <p className="text-xs text-text-muted font-mono pt-4">
          CatatUang Security Framework
        </p>
      </div>
    </div>
  );
}

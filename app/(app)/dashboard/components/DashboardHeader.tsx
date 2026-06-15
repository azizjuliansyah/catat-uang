"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/atoms/Button";
import { User } from "@supabase/supabase-js";
import { PWAInstallButton } from "@/components/pwa/PWAInstallButton";

interface DashboardHeaderProps {
  user: User | null;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 font-sans">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary font-display">
          Halo, {user?.user_metadata?.name || user?.email?.split("@")[0] || "Pengguna"}
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Berikut adalah ringkasan kesehatan keuangan Anda di bulan ini.
        </p>
      </div>

      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
        <PWAInstallButton />
        <Button
          variant="primary"
          size="sm"
          onClick={() => router.push("/transactions/new")}
          className="self-stretch sm:self-auto"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Transaksi Baru
        </Button>
      </div>
    </div>
  );
}

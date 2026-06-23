"use client";

import { useRouter } from "next/navigation";
import { Plus, Home } from "lucide-react";
import { Button } from "@/components/ui/atoms/Button";
import { PageHeader } from "@/components/ui/molecules/PageHeader";
import { User } from "@supabase/supabase-js";
import { PWAInstallButton } from "@/components/pwa/PWAInstallButton";

interface DashboardHeaderProps {
  user: User | null;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter();
  const userName = user?.user_metadata?.name || user?.email?.split("@")[0] || "Pengguna";

  return (
    <PageHeader
      icon={Home}
      title={`Halo, ${userName}`}
      description="Berikut adalah ringkasan kesehatan keuangan Anda di bulan ini."
      actions={
        <>
          <PWAInstallButton />
          <Button
            variant="primary"
            size="sm"
            onClick={() => router.push("/transactions/new")}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Transaksi Baru
          </Button>
        </>
      }
    />
  );
}

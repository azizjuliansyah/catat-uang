"use client";

import { Home } from "lucide-react";
import { PageHeader } from "@/components/ui/molecules/PageHeader";
import { User } from "@supabase/supabase-js";
import { PWAInstallButton } from "@/components/pwa/PWAInstallButton";

interface DashboardHeaderProps {
  user: User | null;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const userName = user?.user_metadata?.name || user?.email?.split("@")[0] || "Pengguna";

  return (
    <PageHeader
      icon={Home}
      title={`Halo, ${userName}`}
      description="Berikut adalah ringkasan kesehatan keuangan Anda di bulan ini."
      actions={
        <PWAInstallButton />
      }
    />
  );
}

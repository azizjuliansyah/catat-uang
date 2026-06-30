"use client";

import { Settings as SettingsIcon } from "lucide-react";
import { PageHeader } from "@/components/ui/molecules/PageHeader";
import { ProfileSecurityCombined } from "@/app/(app)/settings/components/ProfileSecurityCombined";
import { AdminSettingsPageSkeleton } from "./page.skeleton";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <PageHeader
        icon={SettingsIcon}
        iconClassName="w-6 h-6 text-warning"
        title="Pengaturan Admin"
        description="Kelola profil administrator dan keamanan akun Anda."
      />

      {/* Content Area */}
      <ProfileSecurityCombined />
    </div>
  );
}

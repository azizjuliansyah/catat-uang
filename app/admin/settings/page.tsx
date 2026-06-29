"use client";

import { AdminSettingsHeader } from "./components/AdminSettingsHeader";
import { ProfileSecurityCombined } from "@/app/(app)/settings/components/ProfileSecurityCombined";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans">
      {/* Header */}
      <AdminSettingsHeader />

      {/* Content Area */}
      <ProfileSecurityCombined />
    </div>
  );
}

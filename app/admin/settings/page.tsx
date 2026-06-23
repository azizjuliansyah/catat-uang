"use client";

import { useState } from "react";
import { ProfileTab } from "@/app/(app)/settings/components/ProfileTab";
import { SecurityTab } from "@/app/(app)/settings/components/SecurityTab";
import { AdminSettingsHeader } from "./components/AdminSettingsHeader";
import { AdminSettingsTabs } from "./components/AdminSettingsTabs";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans">
      {/* Header */}
      <AdminSettingsHeader />

      {/* Tabs Selector */}
      <AdminSettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Content Area */}
      {activeTab === "profile" && <ProfileTab />}
      {activeTab === "security" && <SecurityTab />}
    </div>
  );
}

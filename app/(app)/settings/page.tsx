"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/molecules/PageHeader";
import { Settings as SettingsIcon } from "lucide-react";
import { CategoriesTab } from "./components/CategoriesTab";
import { TemplatesTab } from "./components/TemplatesTab";
import { SettingsTabs } from "./components/SettingsTabs";
import { ProfileSecurityCombined } from "./components/ProfileSecurityCombined";

type TabType = "profile-security" | "categories" | "templates";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("profile-security");

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <PageHeader
        icon={SettingsIcon}
        title="Pengaturan Aplikasi"
        description="Kelola profil pengguna, kategori transaksi, template transaksi, dan keamanan akun Anda."
      />

      {/* Tabs Selector */}
      <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Content Area */}
      {activeTab === "profile-security" && <ProfileSecurityCombined />}
      {activeTab === "categories" && <CategoriesTab />}
      {activeTab === "templates" && <TemplatesTab />}
    </div>
  );
}

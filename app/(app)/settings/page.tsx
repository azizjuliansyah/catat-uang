"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/molecules/PageHeader";
import { Settings as SettingsIcon } from "lucide-react";
import { ProfileTab } from "./components/ProfileTab";
import { CategoriesTab } from "./components/CategoriesTab";
import { SecurityTab } from "./components/SecurityTab";
import { TemplatesTab } from "./components/TemplatesTab";
import { SettingsTabs } from "./components/SettingsTabs";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "categories" | "security" | "templates">("profile");

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans">
      {/* Header */}
      <PageHeader
        icon={SettingsIcon}
        title="Pengaturan Aplikasi"
        description="Kelola profil pengguna, kategori transaksi, template transaksi, dan keamanan akun Anda."
      />

      {/* Tabs Selector */}
      <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Content Area */}
      {activeTab === "profile" && <ProfileTab />}
      {activeTab === "categories" && <CategoriesTab />}
      {activeTab === "security" && <SecurityTab />}
      {activeTab === "templates" && <TemplatesTab />}
    </div>
  );
}


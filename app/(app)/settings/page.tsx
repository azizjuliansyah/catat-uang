"use client";

import { useState } from "react";
import { TabButton } from "@/components/ui/molecules/TabButton";
import { Settings as SettingsIcon } from "lucide-react";
import { ProfileTab } from "./components/ProfileTab";
import { CategoriesTab } from "./components/CategoriesTab";
import { SecurityTab } from "./components/SecurityTab";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "categories" | "security">("profile");

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2 font-display">
          <SettingsIcon className="w-6 h-6 text-primary" />
          Pengaturan Aplikasi
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Kelola profil pengguna, kategori transaksi, dan keamanan akun Anda.
        </p>
      </div>

      {/* Tabs Selector */}
      <div className="bg-surface-hover/30 border border-border p-1 rounded-xl flex gap-1 self-start max-w-sm flex-wrap">
        <TabButton
          isActive={activeTab === "profile"}
          onClick={() => setActiveTab("profile")}
          className="px-4 py-2.5 text-xs flex-1 min-w-[100px]"
        >
          Profil
        </TabButton>
        
        <TabButton
          isActive={activeTab === "security"}
          onClick={() => setActiveTab("security")}
          className="px-4 py-2.5 text-xs flex-1 min-w-[100px]"
        >
          Keamanan
        </TabButton>

        <TabButton
          isActive={activeTab === "categories"}
          onClick={() => setActiveTab("categories")}
          className="px-4 py-2.5 text-xs flex-1 min-w-[100px]"
        >
          Kategori
        </TabButton>
      </div>

      {/* Content Area */}
      {activeTab === "profile" && <ProfileTab />}
      {activeTab === "categories" && <CategoriesTab />}
      {activeTab === "security" && <SecurityTab />}
    </div>
  );
}

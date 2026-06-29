"use client";

import { User, Shield } from "lucide-react";

interface AdminSettingsTabsProps {
  activeTab: "profile-security";
  onTabChange: (tab: "profile-security") => void;
}

export function AdminSettingsTabs({ activeTab, onTabChange }: AdminSettingsTabsProps) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg font-medium">
        <User className="w-4 h-4" />
        <Shield className="w-4 h-4" />
        <span>Profil & Keamanan</span>
      </div>
    </div>
  );
}

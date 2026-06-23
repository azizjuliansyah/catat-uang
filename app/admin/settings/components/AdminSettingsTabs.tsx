"use client";

import { TabButton, TabButtonGroup } from "@/components/ui/molecules/TabButtonGroup";
import { User, Shield } from "lucide-react";

interface AdminSettingsTabsProps {
  activeTab: "profile" | "security";
  onTabChange: (tab: "profile" | "security") => void;
}

export function AdminSettingsTabs({ activeTab, onTabChange }: AdminSettingsTabsProps) {
  return (
    <TabButtonGroup variant="pill" className="h-10 items-center gap-1 self-start max-w-xs flex-wrap">
      <TabButton
        isActive={activeTab === "profile"}
        onClick={() => onTabChange("profile")}
        variant="pill"
        className="px-2 py-0 h-full text-xs flex-1 min-w-[100px]"
      >
        <User className="w-3.5 h-3.5 mr-1.5 inline" />
        Profil
      </TabButton>

      <TabButton
        isActive={activeTab === "security"}
        onClick={() => onTabChange("security")}
        variant="pill"
        className="px-2 py-0 h-full text-xs flex-1 min-w-[100px]"
      >
        <Shield className="w-3.5 h-3.5 mr-1.5 inline" />
        Keamanan
      </TabButton>
    </TabButtonGroup>
  );
}

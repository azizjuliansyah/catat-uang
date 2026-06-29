"use client";

import { TabButton, TabButtonGroup } from "@/components/ui/molecules/TabButtonGroup";
import { UserShield, FolderOpen, ClipboardCopy } from "lucide-react";

type TabType = "profile-security" | "categories" | "templates";

interface SettingsTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function SettingsTabs({ activeTab, onTabChange }: SettingsTabsProps) {
  return (
    <TabButtonGroup variant="pill" className="h-10 items-center gap-1 self-start max-w-md flex-wrap">
      <TabButton
        isActive={activeTab === "profile-security"}
        onClick={() => onTabChange("profile-security")}
        variant="pill"
        className="px-2 py-0 h-full text-xs flex-1 min-w-[90px]"
      >
        <UserShield className="w-3.5 h-3.5 mr-1.5 inline" />
        Profil & Keamanan
      </TabButton>

      <TabButton
        isActive={activeTab === "categories"}
        onClick={() => onTabChange("categories")}
        variant="pill"
        className="px-2 py-0 h-full text-xs flex-1 min-w-[90px]"
      >
        <FolderOpen className="w-3.5 h-3.5 mr-1.5 inline" />
        Kategori
      </TabButton>

      <TabButton
        isActive={activeTab === "templates"}
        onClick={() => onTabChange("templates")}
        variant="pill"
        className="px-2 py-0 h-full text-xs flex-1 min-w-[90px]"
      >
        <ClipboardCopy className="w-3.5 h-3.5 mr-1.5 inline" />
        Template
      </TabButton>
    </TabButtonGroup>
  );
}

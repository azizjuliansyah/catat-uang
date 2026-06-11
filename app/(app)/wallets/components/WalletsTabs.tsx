import { WalletItem } from "../types";
import { TabButton } from "@/components/ui/molecules/TabButton";

interface WalletsTabsProps {
  activeTab: "active" | "archived";
  onTabChange: (tab: "active" | "archived") => void;
  wallets: WalletItem[];
}

export function WalletsTabs({ activeTab, onTabChange, wallets }: WalletsTabsProps) {
  const activeCount = wallets.filter(w => !w.is_archived).length;
  const archivedCount = wallets.filter(w => w.is_archived).length;

  return (
    <div className="border-b border-border flex gap-4">
      <TabButton
        isActive={activeTab === "active"}
        onClick={() => onTabChange("active")}
        className="pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer uppercase tracking-wider px-0 py-0 min-h-0 bg-transparent"
      >
        Aktif ({activeCount})
      </TabButton>
      <TabButton
        isActive={activeTab === "archived"}
        onClick={() => onTabChange("archived")}
        className="pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer uppercase tracking-wider px-0 py-0 min-h-0 bg-transparent"
      >
        Terarsip ({archivedCount})
      </TabButton>
    </div>
  );
}


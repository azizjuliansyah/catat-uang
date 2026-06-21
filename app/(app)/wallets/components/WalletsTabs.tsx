import { WalletItem } from "../types";

interface WalletsTabsProps {
  activeTab: "active" | "archived";
  onTabChange: (tab: "active" | "archived") => void;
  wallets: WalletItem[];
}

export function WalletsTabs({ activeTab, onTabChange, wallets }: WalletsTabsProps) {
  const activeCount = wallets.filter(w => !w.is_archived).length;
  const archivedCount = wallets.filter(w => w.is_archived).length;

  return (
    <div className="flex gap-1 border-b border-border">
      <button
        onClick={() => onTabChange("active")}
        className={`
          px-4 py-3 text-sm font-medium transition-all duration-150 ease relative
          ${activeTab === "active"
            ? "text-text-primary"
            : "text-text-secondary hover:text-text-primary"
          }
        `}
      >
        Aktif ({activeCount})
        {activeTab === "active" && (
          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
        )}
      </button>
      <button
        onClick={() => onTabChange("archived")}
        className={`
          px-4 py-3 text-sm font-medium transition-all duration-150 ease relative
          ${activeTab === "archived"
            ? "text-text-primary"
            : "text-text-secondary hover:text-text-primary"
          }
        `}
      >
        Terarsip ({archivedCount})
        {activeTab === "archived" && (
          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
        )}
      </button>
    </div>
  );
}

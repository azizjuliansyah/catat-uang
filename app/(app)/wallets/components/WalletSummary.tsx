import { WalletItem } from "../types";
import { formatIDR } from "../utils";

interface WalletSummaryProps {
  activeWalletsTotal: number;
  wallets: WalletItem[];
  isLoading?: boolean;
}

export function WalletSummary({
  activeWalletsTotal,
  wallets,
  isLoading = false,
}: WalletSummaryProps) {
  const activeCount = wallets.filter(w => !w.is_archived).length;

  return (
    <div className="bg-surface-card border border-border rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-label text-text-secondary uppercase tracking-wide">
            Total Saldo Aktif
          </p>
          <p className="text-metric text-text-primary font-mono mt-2">
            {isLoading ? "Rp 0" : formatIDR(activeWalletsTotal)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-caption text-text-secondary">
            {activeCount} Dompet Aktif
          </p>
        </div>
      </div>
    </div>
  );
}

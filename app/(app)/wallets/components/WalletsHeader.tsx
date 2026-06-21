import { Button } from "@/components/ui/atoms/Button";
import { Plus, ArrowRightLeft } from "lucide-react";
import { WalletItem } from "../types";
import { formatIDR } from "../utils";

interface WalletsHeaderProps {
  activeWalletsTotal: number;
  wallets: WalletItem[];
  onTransferClick: () => void;
  onAddClick: () => void;
}

export function WalletsHeader({
  activeWalletsTotal,
  wallets,
  onTransferClick,
  onAddClick
}: WalletsHeaderProps) {
  const activeCount = wallets.filter(w => !w.is_archived).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Page Title + Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-page-title text-text-primary font-display">
            Kelola Dompet
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="md"
            onClick={onTransferClick}
            disabled={activeCount < 2}
          >
            <ArrowRightLeft className="w-4 h-4 mr-2" />
            Transfer
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={onAddClick}
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Dompet
          </Button>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-surface-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-label text-text-secondary uppercase tracking-wide">
              Total Saldo Aktif
            </p>
            <p className="text-metric text-text-primary font-mono mt-2">
              {formatIDR(activeWalletsTotal)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-caption text-text-secondary">
              {activeCount} Dompet Aktif
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

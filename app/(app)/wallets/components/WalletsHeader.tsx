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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary font-display">Kelola Dompet</h1>
        <p className="text-xs text-text-secondary mt-1">
          Total saldo aktif: <span className="font-bold text-text-primary font-mono">{formatIDR(activeWalletsTotal)}</span>
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={onTransferClick}
          disabled={activeCount < 2}
        >
          <ArrowRightLeft className="w-4 h-4 mr-1.5" />
          Transfer Saldo
        </Button>

        <Button
          variant="primary"
          size="sm"
          onClick={onAddClick}
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Tambah Dompet
        </Button>
      </div>
    </div>
  );
}

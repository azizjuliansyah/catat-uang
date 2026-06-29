import { Button } from "@/components/ui/atoms/Button";
import { PageHeader } from "@/components/ui/molecules/PageHeader";
import { Plus, ArrowRightLeft, Wallet } from "lucide-react";
import { WalletItem } from "../types";
import { formatIDR } from "../utils";

interface WalletsHeaderProps {
  activeWalletsTotal: number;
  wallets: WalletItem[];
  onTransferClick: () => void;
  onAddClick: () => void;
  isLoading?: boolean;
}

export function WalletsHeader({
  activeWalletsTotal,
  wallets,
  onTransferClick,
  onAddClick,
  isLoading = false,
}: WalletsHeaderProps) {
  const activeCount = wallets.filter(w => !w.is_archived).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Page Title + Actions */}
      <PageHeader
        icon={Wallet}
        title="Kelola Dompet"
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={onTransferClick}
              disabled={activeCount < 2}
            >
              <ArrowRightLeft className="w-4 h-4 mr-1.5" />
              Transfer
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={onAddClick}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Tambah Dompet
            </Button>
          </>
        }
      />

      {/* Summary Card */}
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
    </div>
  );
}

import { Button } from "@/components/ui/atoms/Button";
import { PageHeader } from "@/components/ui/molecules/PageHeader";
import { Plus, ArrowRightLeft, Wallet } from "lucide-react";
import { WalletItem } from "../types";

interface WalletHeaderProps {
  wallets: WalletItem[];
  onTransferClick: () => void;
  onAddClick: () => void;
}

export function WalletHeader({
  wallets,
  onTransferClick,
  onAddClick,
}: WalletHeaderProps) {
  const activeCount = wallets.filter(w => !w.is_archived).length;

  return (
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
  );
}

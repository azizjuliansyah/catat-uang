import { Plus, HandCoins } from "lucide-react";
import { Button } from "@/components/ui/atoms/Button";
import { PageHeader } from "@/components/ui/molecules/PageHeader";

interface DebtHeaderProps {
  onAddClick: () => void;
}

export function DebtHeader({ onAddClick }: DebtHeaderProps) {
  return (
    <PageHeader
      icon={HandCoins}
      title="Kelola Hutang & Piutang"
      description="Catat dan lacak pembayaran hutang piutang Anda dengan mudah."
      actions={
        <Button size="sm" onClick={onAddClick}>
          <Plus className="w-4 h-4 mr-1.5" />
          Tambah Catatan
        </Button>
      }
    />
  );
}

import { ArrowRightLeft, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/atoms/Button";
import { PageHeader } from "@/components/ui/molecules/PageHeader";

interface TransactionsHeaderProps {
  onRunTemplatesClick: () => void;
  onCreateTransactionClick: () => void;
}

export function TransactionsHeader({
  onRunTemplatesClick,
  onCreateTransactionClick,
}: TransactionsHeaderProps) {
  return (
    <PageHeader
      icon={ArrowRightLeft}
      title="Daftar Transaksi"
      description="Lihat, cari, filter, dan kelola semua catatan keuangan Anda."
      actions={
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRunTemplatesClick}
          >
            <Sparkles className="w-4 h-4 mr-1.5 text-primary" />
            Jalankan Template
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onCreateTransactionClick}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Transaksi Baru
          </Button>
        </>
      }
    />
  );
}

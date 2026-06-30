import { Plus, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/atoms/Button";
import { PageHeader } from "@/components/ui/molecules/PageHeader";

interface PaylaterHeaderProps {
  onAddClick: () => void;
}

export function PaylaterHeader({ onAddClick }: PaylaterHeaderProps) {
  return (
    <PageHeader
      icon={CreditCard}
      title="Kelola Paylater"
      description="Kelola batas kredit, siklus tagihan, jatuh tempo, dan bayar tagihan platform Paylater Anda."
      actions={
        <Button onClick={onAddClick} size="sm">
          <Plus className="w-4 h-4 mr-1.5" />
          Platform Baru
        </Button>
      }
    />
  );
}

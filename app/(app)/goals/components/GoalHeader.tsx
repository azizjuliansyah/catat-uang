import { Plus, PiggyBank } from "lucide-react";
import { Button } from "@/components/ui/atoms/Button";
import { PageHeader } from "@/components/ui/molecules/PageHeader";

interface GoalHeaderProps {
  onAddClick: () => void;
}

export function GoalHeader({ onAddClick }: GoalHeaderProps) {
  return (
    <PageHeader
      icon={PiggyBank}
      title="Rencana Tabungan (Goals)"
      description="Rencanakan, tabung, dan capai impian finansial Anda secara terstruktur."
      actions={
        <Button onClick={onAddClick} size="sm">
          <Plus className="w-4 h-4 mr-1.5" />
          Target Baru
        </Button>
      }
    />
  );
}

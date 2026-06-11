import { Modal } from "@/components/ui/organisms/Modal";
import { Button } from "@/components/ui/atoms/Button";
import { SavingGoal } from "../../types";
import { AlertCircle } from "lucide-react";

interface DeleteGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalToDelete: SavingGoal | null;
  onConfirm: () => void;
  isSubmitting: boolean;
}

export function DeleteGoalModal({
  isOpen,
  onClose,
  goalToDelete,
  onConfirm,
  isSubmitting
}: DeleteGoalModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Hapus Target Tabungan?"
      isDestructive
      footer={
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="flex-1"
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            isLoading={isSubmitting}
            className="flex-1"
          >
            Hapus
          </Button>
        </>
      }
    >
      <div className="space-y-4 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-danger/10 text-danger mb-2">
          <AlertCircle className="w-6 h-6" />
        </div>
        <p className="text-xs text-text-secondary leading-relaxed">
          Apakah Anda yakin ingin menghapus target tabungan <span className="font-bold text-text-primary">{goalToDelete?.name}</span>?
          <br/><br/>
          Tindakan ini juga akan menghapus riwayat top-up/penarikan dan dana terkumpul pada target ini akan terhapus. Tindakan ini tidak dapat dibatalkan.
        </p>
      </div>
    </Modal>
  );
}

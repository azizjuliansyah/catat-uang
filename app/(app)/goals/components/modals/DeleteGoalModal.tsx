import { Modal } from "@/components/ui/organisms/Modal";
import { ModalFooter } from "@/components/ui/molecules/ModalFooter";
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
        <ModalFooter
          onCancel={onClose}
          onSubmit={onConfirm}
          isSubmitting={isSubmitting}
          cancelText="Batal"
          submitText="Hapus"
          variant="destructive"
        />
      }
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-md bg-danger/10 text-danger flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="flex-1 text-sm text-text-secondary leading-relaxed">
          <p>
            Apakah Anda yakin ingin menghapus target tabungan <span className="font-bold text-text-primary">{goalToDelete?.name}</span>?
          </p>
          <p className="mt-2">
            Tindakan ini juga akan menghapus riwayat top-up/penarikan dan dana terkumpul pada target ini akan terhapus. Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>
      </div>
    </Modal>
  );
}

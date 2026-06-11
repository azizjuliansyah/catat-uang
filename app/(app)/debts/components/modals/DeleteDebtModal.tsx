import { DeleteConfirmationModal } from "@/components/ui/organisms/DeleteConfirmationModal";
import { DebtItem } from "../../types";

interface DeleteDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  debtToDelete: DebtItem | null;
  onConfirm: () => void;
  isSubmitting: boolean;
}

export function DeleteDebtModal({
  isOpen,
  onClose,
  debtToDelete,
  onConfirm,
  isSubmitting
}: DeleteDebtModalProps) {
  return (
    <DeleteConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      title="Hapus Catatan Hutang/Piutang?"
      onConfirm={onConfirm}
      isSubmitting={isSubmitting}
    >
      Apakah Anda yakin ingin menghapus catatan transaksi dengan kontak{" "}
      <span className="font-bold text-text-primary">{debtToDelete?.name}</span>?
      <br />
      <br />
      Tindakan ini juga akan menghapus seluruh riwayat cicilan yang terkait dan tidak dapat dibatalkan.
    </DeleteConfirmationModal>
  );
}

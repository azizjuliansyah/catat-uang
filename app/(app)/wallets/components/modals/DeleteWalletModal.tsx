import { DeleteConfirmationModal } from "@/components/ui/organisms/DeleteConfirmationModal";
import { WalletItem } from "../../types";

interface DeleteWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletToDelete: WalletItem | null;
  onConfirm: () => void;
  isSubmitting: boolean;
}

export function DeleteWalletModal({
  isOpen,
  onClose,
  walletToDelete,
  onConfirm,
  isSubmitting
}: DeleteWalletModalProps) {
  return (
    <DeleteConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      title="Hapus Dompet?"
      onConfirm={onConfirm}
      isSubmitting={isSubmitting}
    >
      Apakah Anda yakin ingin menghapus dompet{" "}
      <span className="font-bold text-text-primary">{walletToDelete?.name}</span>?
      <br />
      <br />
      Tindakan ini juga akan menghapus semua riwayat transaksi yang terkait dengan dompet ini dan tidak dapat dibatalkan.
    </DeleteConfirmationModal>
  );
}

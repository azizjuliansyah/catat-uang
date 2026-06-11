import { DeleteConfirmationModal } from "@/components/ui/organisms/DeleteConfirmationModal";
import { GoalTransaction } from "../../types";
import { formatIDR } from "@/lib/utils/format";

interface DeleteTxModalProps {
  isOpen: boolean;
  onClose: () => void;
  txToDelete: GoalTransaction | null;
  onConfirm: () => void;
  isSubmitting: boolean;
}

export function DeleteTxModal({
  isOpen,
  onClose,
  txToDelete,
  onConfirm,
  isSubmitting
}: DeleteTxModalProps) {
  return (
    <DeleteConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      title="Hapus Transaksi Tabungan?"
      onConfirm={onConfirm}
      isSubmitting={isSubmitting}
    >
      Apakah Anda yakin ingin menghapus transaksi{" "}
      {txToDelete?.type === "topup" ? "Top-up" : "Penarikan"} sebesar{" "}
      <span className="font-bold text-text-primary font-mono">
        {txToDelete && formatIDR(txToDelete.amount)}
      </span>
      ?
      <br />
      <br />
      Saldo dompet asal yang terpotong/bertambah akan disesuaikan kembali secara otomatis.
    </DeleteConfirmationModal>
  );
}

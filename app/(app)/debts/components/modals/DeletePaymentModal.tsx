import { DeleteConfirmationModal } from "@/components/ui/organisms/DeleteConfirmationModal";
import { DebtPaymentItem } from "../../types";
import { formatIDR } from "@/lib/utils/format";

interface DeletePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentToDelete: DebtPaymentItem | null;
  onConfirm: () => void;
  isSubmitting: boolean;
}

export function DeletePaymentModal({
  isOpen,
  onClose,
  paymentToDelete,
  onConfirm,
  isSubmitting
}: DeletePaymentModalProps) {
  return (
    <DeleteConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      title="Hapus Riwayat Pembayaran?"
      onConfirm={onConfirm}
      isSubmitting={isSubmitting}
    >
      Apakah Anda yakin ingin menghapus cicilan sejumlah{" "}
      <span className="font-bold text-text-primary font-mono">
        {paymentToDelete && formatIDR(paymentToDelete.amount)}
      </span>
      ?
      <br />
      <br />
      Saldo dompet asal yang terpotong/bertambah akan disesuaikan kembali secara otomatis.
    </DeleteConfirmationModal>
  );
}

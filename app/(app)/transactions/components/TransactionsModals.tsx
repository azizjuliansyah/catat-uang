import { Modal } from "@/components/ui/organisms/Modal";
import { DeleteConfirmationModal } from "@/components/ui/organisms/DeleteConfirmationModal";
import { TransactionDetailModal } from "@/components/ui/organisms/TransactionDetailModal";
import { Button } from "@/components/ui/atoms/Button";
import { DetailLink } from "@/components/ui/atoms/DetailLink";
import { EditTransactionModal } from "./EditTransactionModal";
import { Transaction } from "../types";

interface TransactionsModalsProps {
  // Edit modal props
  isEditOpen: boolean;
  onCloseEdit: () => void;
  onEditSuccess: () => void;
  transactionToEdit: Transaction | null;

  // Detail modal props
  isDetailOpen: boolean;
  onCloseDetail: () => void;
  transactionToView: Transaction | null;

  // Delete modal props
  transactionToDelete: Transaction | null;
  onCloseDelete: () => void;
  onConfirmDelete: () => void;
  isDeleting: boolean;

  // Receipt modal props
  receiptModalUrl: string | null;
  onCloseReceipt: () => void;
  formatIDR: (val: number) => string;
}

export function TransactionsModals({
  isEditOpen,
  onCloseEdit,
  onEditSuccess,
  transactionToEdit,
  isDetailOpen,
  onCloseDetail,
  transactionToView,
  transactionToDelete,
  onCloseDelete,
  onConfirmDelete,
  isDeleting,
  receiptModalUrl,
  onCloseReceipt,
  formatIDR,
}: TransactionsModalsProps) {
  return (
    <>

      {/* Edit Transaction Modal */}
      {transactionToEdit && (
        <EditTransactionModal
          isOpen={isEditOpen}
          onClose={onCloseEdit}
          onSuccess={onEditSuccess}
          transaction={transactionToEdit}
        />
      )}

      {/* Detail Modal */}
      <TransactionDetailModal
        isOpen={isDetailOpen}
        onClose={onCloseDetail}
        transaction={transactionToView}
      />

      {/* Delete Transaction Modal */}
      <DeleteConfirmationModal
        isOpen={transactionToDelete !== null}
        onClose={onCloseDelete}
        onConfirm={onConfirmDelete}
        title="Hapus Transaksi?"
        isSubmitting={isDeleting}
      >
        {transactionToDelete ? (
          <>
            Apakah Anda yakin ingin menghapus transaksi{" "}
            <span className="font-bold text-text-primary">
              {transactionToDelete.description ||
                transactionToDelete.categories?.name ||
                "Pemasukan/Pengeluaran"}
            </span>{" "}
            sebesar{" "}
            <span className="font-bold text-text-primary">
              {formatIDR(transactionToDelete.amount)}
            </span>
            ? Saldo dompet akan disesuaikan secara otomatis.
          </>
        ) : ""}
      </DeleteConfirmationModal>

      {/* Receipt Image Modal */}
      <Modal
        isOpen={receiptModalUrl !== null}
        onClose={onCloseReceipt}
        title="Nota Lampiran Transaksi"
        className="sm:max-w-xl md:max-w-2xl"
        footer={
          <Button
            variant="ghost"
            size="sm"
            onClick={onCloseReceipt}
            className="w-full"
          >
            Tutup
          </Button>
        }
      >
        <div className="flex flex-col gap-3">
          {receiptModalUrl && (
            <div className="flex justify-end">
              <DetailLink
                href={receiptModalUrl}
                target="_blank"
                rel="noopener noreferrer"
                label="Buka di Tab Baru"
                size="sm"
                variant="primary"
              />
            </div>
          )}
          <div className="w-full max-h-[60vh] overflow-auto rounded-xl bg-black/40 flex items-center justify-center border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={receiptModalUrl || ""}
              alt="Nota Transaksi"
              className="max-w-full max-h-[60vh] object-contain rounded"
            />
          </div>
        </div>
      </Modal>
    </>
  );
}

// Re-export individual modals for convenience
export { CreateTransactionModal } from "./CreateTransactionModal";
export { EditTransactionModal } from "./EditTransactionModal";

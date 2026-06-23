import React from "react";
import { Modal } from "@/components/ui/organisms/Modal";
import { DeleteConfirmationModal } from "@/components/ui/organisms/DeleteConfirmationModal";
import { TransactionDetailModal } from "@/components/ui/organisms/TransactionDetailModal";
import { CreateTransactionModal } from "./CreateTransactionModal";
import { EditTransactionModal } from "./EditTransactionModal";
import { Transaction } from "../types";

interface TransactionsModalsProps {
  // Create modal props
  isCreateOpen: boolean;
  onCloseCreate: () => void;
  onCreateSuccess: () => void;

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
  isCreateOpen,
  onCloseCreate,
  onCreateSuccess,
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
      {/* Create Transaction Modal */}
      <CreateTransactionModal
        isOpen={isCreateOpen}
        onClose={onCloseCreate}
        onSuccess={onCreateSuccess}
      />

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
        isDestructive
        title="Hapus Transaksi?"
        message={
          transactionToDelete ?
            `Apakah Anda yakin ingin menghapus transaksi ${
              transactionToDelete.description ||
              transactionToDelete.categories?.name ||
              "Pemasukan/Pengeluaran"
            } sebesar ${formatIDR(transactionToDelete.amount)}? Saldo dompet akan disesuaikan secara otomatis.`
          : ""
        }
        confirmText="Hapus"
        isConfirming={isDeleting}
      />

      {/* Receipt Image Modal */}
      <Modal
        isOpen={receiptModalUrl !== null}
        onClose={onCloseReceipt}
        title="Nota Lampiran Transaksi"
        className="sm:max-w-xl md:max-w-2xl"
      >
        <div className="flex flex-col items-center gap-4">
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

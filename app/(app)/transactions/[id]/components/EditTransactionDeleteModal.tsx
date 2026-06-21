import React from "react";
import { Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/organisms/Modal";
import { Button } from "@/components/ui/atoms/Button";
import { useEditTransactionState } from "../hooks/useEditTransactionState";
import { useEditTransactionHandlers } from "../hooks/useEditTransactionHandlers";

interface EditTransactionDeleteModalProps {
  state: ReturnType<typeof useEditTransactionState>;
  handlers: ReturnType<typeof useEditTransactionHandlers>;
}

export function EditTransactionDeleteModal({ state, handlers }: EditTransactionDeleteModalProps) {
  const { isDeleteModalOpen, setIsDeleteModalOpen, deleting } = state;
  const { handleDeleteTransaction } = handlers;

  return (
    <Modal
      isOpen={isDeleteModalOpen}
      onClose={() => setIsDeleteModalOpen(false)}
      title="Hapus Catatan Transaksi?"
      isDestructive
      footer={
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDeleteModalOpen(false)}
            className="flex-1"
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteTransaction}
            isLoading={deleting}
            className="flex-1"
          >
            Hapus
          </Button>
        </>
      }
    >
      <div className="space-y-4 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-danger/10 text-danger mb-2">
          <Trash2 className="w-6 h-6" />
        </div>
        <p className="text-xs text-text-secondary leading-relaxed">
          Apakah Anda yakin ingin menghapus transaksi ini secara permanen?
          <br />
          Saldo dompet Anda akan disesuaikan kembali secara otomatis.
        </p>
      </div>
    </Modal>
  );
}

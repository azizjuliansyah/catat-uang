import React from "react";
import { Modal } from "@/components/ui/organisms/Modal";
import { Button } from "@/components/ui/atoms/Button";
import { Trash2 } from "lucide-react";
import { Transaction } from "../types";

interface TransactionsModalsProps {
  transactionToDelete: Transaction | null;
  onCloseDelete: () => void;
  onConfirmDelete: () => void;
  isDeleting: boolean;
  receiptModalUrl: string | null;
  onCloseReceipt: () => void;
  formatIDR: (val: number) => string;
}

export function TransactionsModals({
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
      {/* Delete Transaction Modal */}
      <Modal
        isOpen={transactionToDelete !== null}
        onClose={onCloseDelete}
        title="Hapus Transaksi?"
        isDestructive
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={onCloseDelete} className="flex-1">
              Batal
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={onConfirmDelete}
              isLoading={isDeleting}
              className="flex-1"
            >
              Hapus
            </Button>
          </>
        }
      >
        <div className="space-y-5 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-danger/10 text-danger mb-2">
            <Trash2 className="w-6 h-6" />
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Apakah Anda yakin ingin menghapus transaksi{" "}
            <strong>
              {transactionToDelete?.description ||
                transactionToDelete?.categories?.name ||
                "Pemasukan/Pengeluaran"}
            </strong>{" "}
            sebesar{" "}
            <strong>
              {transactionToDelete ? formatIDR(transactionToDelete.amount) : ""}
            </strong>
            ? Saldo dompet akan disesuaikan secara otomatis.
          </p>
        </div>
      </Modal>

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

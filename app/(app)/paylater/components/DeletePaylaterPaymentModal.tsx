"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/organisms/Modal";
import { ModalFooter } from "@/components/ui/molecules/ModalFooter";
import { formatIDR } from "@/lib/utils/format";

interface PaylaterPayment {
  id: string;
  amount: number;
  payment_date: string;
  created_at: string;
  wallets: {
    id: string;
    name: string;
  } | null;
}

interface DeletePaylaterPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentToDelete: PaylaterPayment | null;
  onConfirm: () => void;
}

export function DeletePaylaterPaymentModal({
  isOpen,
  onClose,
  paymentToDelete,
  onConfirm
}: DeletePaylaterPaymentModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Hapus Pembayaran?"
      isDestructive
      footer={
        <ModalFooter
          onCancel={onClose}
          onSubmit={handleConfirm}
          isSubmitting={isDeleting}
          cancelText="Batal"
          submitText="Hapus"
          variant="destructive"
        />
      }
    >
      <div className="space-y-4">
        {paymentToDelete && (
          <>
            <p className="text-sm text-text-secondary">
              Apakah Anda yakin ingin menghapus pembayaran ini? Tindakan ini akan:
            </p>
            <ul className="text-sm text-text-secondary space-y-1 list-disc list-inside">
              <li>Menghapus catatan pembayaran sebesar <strong className="text-text-primary">{formatIDR(paymentToDelete.amount)}</strong></li>
              <li>Menambah kembali tagihan paylater sebesar jumlah tersebut</li>
              <li>Mengembalikan saldo dompet ke posisi sebelum pembayaran</li>
            </ul>
            <div className="bg-surface-card border border-border rounded-xl p-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-text-secondary">Jumlah</span>
                <span className="font-bold text-text-primary font-mono">{formatIDR(paymentToDelete.amount)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-text-secondary">Dari Dompet</span>
                <span className="text-text-primary">{paymentToDelete.wallets?.name || "Dompet Terhapus"}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

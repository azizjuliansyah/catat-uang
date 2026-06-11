import { Modal } from "@/components/ui/organisms/Modal";
import { FormField } from "@/components/ui/molecules/FormField";
import { Button } from "@/components/ui/atoms/Button";
import { DebtItem } from "../../types";
import { formatIDR } from "../../utils";
import { ProofUploader } from "./ProofUploader";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  payingDebt: DebtItem | null;
  payAmount: string;
  setPayAmount: (v: string) => void;
  payWalletId: string;
  setPayWalletId: (v: string) => void;
  payDate: string;
  setPayDate: (v: string) => void;
  payProofFiles: File[] | null;
  setPayProofFiles: (files: File[] | null) => void;
  payProofPreviews: string[] | null;
  setPayProofPreviews: (previews: string[] | null) => void;
  isSubmitting: boolean;
  wallets: Array<{ id: string; name: string; balance: number; is_archived: boolean }>;
}

export function PaymentModal({
  isOpen,
  onClose,
  onSubmit,
  payingDebt,
  payAmount,
  setPayAmount,
  payWalletId,
  setPayWalletId,
  payDate,
  setPayDate,
  payProofFiles,
  setPayProofFiles,
  payProofPreviews,
  setPayProofPreviews,
  isSubmitting,
  wallets
}: PaymentModalProps) {
  const activeWallets = wallets.filter(w => !w.is_archived);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Bayar Cicilan: ${payingDebt?.name}`}
      onSubmit={onSubmit}
      footer={
        <>
          <Button type="button" variant="ghost" size="sm" fullWidth onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting} fullWidth>
            Simpan Pembayaran
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <FormField
          label="Jumlah Pembayaran (Rupiah)"
          required
          type="currency"
          value={payAmount}
          onChange={(e) => setPayAmount(e.target.value)}
          placeholder="0"
        />

        <FormField
          label="Bayar Menggunakan Dompet"
          required
          type="select"
          value={payWalletId}
          onChange={(e) => setPayWalletId(e.target.value)}
          options={activeWallets.map(w => ({
            value: w.id,
            label: `${w.name} (${formatIDR(w.balance)})`
          }))}
        />

        <FormField
          label="Tanggal Pembayaran"
          required
          type="datetime-local"
          value={payDate}
          onChange={(e) => setPayDate(e.target.value)}
        />

        {/* Proof of Payment Uploader */}
        <ProofUploader
          proofFiles={payProofFiles}
          proofPreviews={payProofPreviews}
          onFilesChange={(files) => {
            if (files && files.length > 0) {
              const newPreviews: string[] = [];
              let loadedCount = 0;

              files.forEach((file) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                  newPreviews.push(reader.result as string);
                  loadedCount++;
                  if (loadedCount === files.length) {
                    setPayProofPreviews(newPreviews);
                  }
                };
                reader.readAsDataURL(file);
              });
              setPayProofFiles(files);
            } else {
              setPayProofFiles(null);
              setPayProofPreviews(null);
            }
          }}
        />
      </div>
    </Modal>
  );
}

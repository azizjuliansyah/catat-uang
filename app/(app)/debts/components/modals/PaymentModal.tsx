import { Modal } from "@/components/ui/organisms/Modal";
import { FormField } from "@/components/ui/molecules/FormField";
import { CurrencyInput } from "@/components/ui/atoms/CurrencyInput";
import { DatetimeInput } from "@/components/ui/atoms/DatetimeInput";
import { CustomSelect } from "@/components/ui/atoms/CustomSelect";
import { ModalFooter } from "@/components/ui/molecules/ModalFooter";
import { DebtItem } from "../../types";
import { formatIDR } from "../../utils";
import { ProofUploader } from "./ProofUploader";
import { Wallet } from "lucide-react";

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
      title={payingDebt?.type === "lend" ? `Catat Pelunasan: ${payingDebt?.name}` : `Bayar Cicilan: ${payingDebt?.name}`}
      onSubmit={onSubmit}
      footer={
        <ModalFooter
          onCancel={onClose}
          isSubmitting={isSubmitting}
          submitText="Simpan Pembayaran"
        />
      }
    >
      <div className="space-y-4">
        <FormField
          label="Jumlah Pembayaran (Rupiah)"
          required
        >
          <CurrencyInput
            value={payAmount}
            onChange={(e) => setPayAmount(e.target.value)}
            placeholder="0"
          />
        </FormField>

        <FormField
          label={payingDebt?.type === "lend" ? "Bayar Ke Dompet" : "Bayar Menggunakan Dompet"}
          required
        >
          <CustomSelect
            value={payWalletId}
            onChange={setPayWalletId}
            options={activeWallets.map(w => ({
              value: w.id,
              label: `${w.name} (${formatIDR(w.balance)})`,
              icon: <Wallet className="w-4 h-4 text-text-secondary" />
            }))}
            placeholder="Pilih Dompet"
          />
        </FormField>

        <FormField
          label="Tanggal Pembayaran"
          required
        >
          <DatetimeInput
            value={payDate}
            onChange={(e) => setPayDate(e.target.value)}
          />
        </FormField>

        {/* Proof of Payment Uploader */}
        <ProofUploader
          proofFiles={payProofFiles}
          proofPreviews={payProofPreviews}
          onFilesChange={setPayProofFiles}
        />
      </div>
    </Modal>
  );
}

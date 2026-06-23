import { Modal } from "@/components/ui/organisms/Modal";
import { FormField } from "@/components/ui/molecules/FormField";
import { CustomSelect } from "@/components/ui/atoms/CustomSelect";
import { ModalFooter } from "@/components/ui/molecules/ModalFooter";
import { SavingGoal } from "../../types";
import { formatIDR } from "../../utils";
import { Wallet } from "lucide-react";

interface TopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  selectedGoal: SavingGoal | null;
  txAmount: string;
  onTxAmountChange: (value: string) => void;
  txWalletId: string;
  onTxWalletIdChange: (value: string) => void;
  txDate: string;
  onTxDateChange: (value: string) => void;
  isSubmitting: boolean;
  wallets: Array<{ id: string; name: string; balance: number }>;
}

export function TopupModal({
  isOpen,
  onClose,
  onSubmit,
  selectedGoal,
  txAmount,
  onTxAmountChange,
  txWalletId,
  onTxWalletIdChange,
  txDate,
  onTxDateChange,
  isSubmitting,
  wallets
}: TopupModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Top-up Rencana: ${selectedGoal?.name}`}
      onSubmit={onSubmit}
      footer={
        <ModalFooter
          onCancel={onClose}
          isSubmitting={isSubmitting}
          submitText="Simpan Top-up"
        />
      }
    >
      <div className="space-y-4">
        <FormField
          label="Jumlah Top-up (Rupiah)"
          required
          type="currency"
          value={txAmount}
          onChange={(e) => onTxAmountChange(e.target.value)}
          placeholder="0"
        />

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-secondary">
            Gunakan Dana Dari Dompet <span className="text-danger">*</span>
          </label>
          <CustomSelect
            value={txWalletId}
            onChange={onTxWalletIdChange}
            options={wallets.map(w => ({
              value: w.id,
              label: `${w.name} (${formatIDR(w.balance)})`,
              icon: <Wallet className="w-4 h-4 text-text-secondary" />
            }))}
            placeholder="Pilih Dompet"
          />
        </div>

        <FormField
          label="Tanggal Transaksi"
          required
          type="datetime-local"
          value={txDate}
          onChange={(e) => onTxDateChange(e.target.value)}
        />
      </div>
    </Modal>
  );
}

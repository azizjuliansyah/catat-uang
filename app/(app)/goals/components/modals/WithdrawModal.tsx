import { Modal } from "@/components/ui/organisms/Modal";
import { FormField } from "@/components/ui/molecules/FormField";
import { Button } from "@/components/ui/atoms/Button";
import { SavingGoal } from "../../types";
import { formatIDR } from "../../utils";

interface WithdrawModalProps {
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

export function WithdrawModal({
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
}: WithdrawModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Tarik Dana Target: ${selectedGoal?.name}`}
      onSubmit={onSubmit}
      footer={
        <>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            fullWidth
            onClick={onClose}
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            fullWidth
          >
            Simpan Penarikan
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <FormField
          label="Jumlah Penarikan (Rupiah)"
          required
          type="currency"
          value={txAmount}
          onChange={(e) => onTxAmountChange(e.target.value)}
          placeholder="0"
        />

        <FormField
          label="Simpan Dana Ke Dompet"
          required
          type="select"
          value={txWalletId}
          onChange={(e) => onTxWalletIdChange(e.target.value)}
          options={wallets.map(w => ({
            value: w.id,
            label: `${w.name} (${formatIDR(w.balance)})`
          }))}
        />

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

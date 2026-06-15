import { Modal } from "@/components/ui/organisms/Modal";
import { FormField } from "@/components/ui/molecules/FormField";
import { Button } from "@/components/ui/atoms/Button";
import { CustomSelect } from "@/components/ui/atoms/CustomSelect";
import { WalletItem } from "../../types";
import { formatIDR } from "../../utils";
import { Wallet } from "lucide-react";

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  wallets: WalletItem[];
  tfSourceId: string;
  setTfSourceId: (v: string) => void;
  tfDestId: string;
  setTfDestId: (v: string) => void;
  tfAmount: string;
  setTfAmount: (v: string) => void;
  tfDate: string;
  setTfDate: (v: string) => void;
  tfDescription: string;
  setTfDescription: (v: string) => void;
  isSubmitting: boolean;
}

export function TransferModal({
  isOpen,
  onClose,
  onSubmit,
  wallets,
  tfSourceId,
  setTfSourceId,
  tfDestId,
  setTfDestId,
  tfAmount,
  setTfAmount,
  tfDate,
  setTfDate,
  tfDescription,
  setTfDescription,
  isSubmitting
}: TransferModalProps) {
  const activeWallets = wallets.filter(w => !w.is_archived);
  const availableDestWallets = activeWallets.filter(w => w.id !== tfSourceId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Transfer Saldo Antar Dompet"
      onSubmit={onSubmit}
      footer={
        <>
          <Button type="button" variant="ghost" size="sm" fullWidth onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting} fullWidth>
            Kirim Transfer
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-secondary">
            Dompet Asal <span className="text-danger">*</span>
          </label>
          <CustomSelect
            value={tfSourceId}
            onChange={setTfSourceId}
            options={activeWallets.map(w => ({
              value: w.id,
              label: `${w.name} (${formatIDR(w.balance)})`,
              icon: <Wallet className="w-4 h-4 text-text-secondary" />
            }))}
            placeholder="Pilih Dompet Asal"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-secondary">
            Dompet Tujuan <span className="text-danger">*</span>
          </label>
          <CustomSelect
            value={tfDestId}
            onChange={setTfDestId}
            options={availableDestWallets.map(w => ({
              value: w.id,
              label: `${w.name} (${formatIDR(w.balance)})`,
              icon: <Wallet className="w-4 h-4 text-text-secondary" />
            }))}
            placeholder="Pilih Dompet Tujuan"
          />
        </div>

        <FormField
          label="Jumlah Transfer (Rupiah)"
          required
          type="currency"
          value={tfAmount}
          onChange={(e) => setTfAmount(e.target.value)}
          placeholder="0"
        />

        <FormField
          label="Tanggal Transfer"
          required
          type="datetime-local"
          value={tfDate}
          onChange={(e) => setTfDate(e.target.value)}
        />

        <FormField
          label="Catatan (Opsional)"
          type="textarea"
          value={tfDescription}
          onChange={(e) => setTfDescription(e.target.value)}
          placeholder="Contoh: Pindah saldo kas, top up saldo e-wallet"
          resize="none"
        />
      </div>
    </Modal>
  );
}

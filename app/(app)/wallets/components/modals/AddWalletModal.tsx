import { Modal } from "@/components/ui/organisms/Modal";
import { FormField } from "@/components/ui/molecules/FormField";
import { CurrencyInput } from "@/components/ui/atoms/CurrencyInput";
import { Input } from "@/components/ui/atoms/Input";
import { Checkbox } from "@/components/ui/atoms/Checkbox";
import { IconSelector } from "@/components/ui/molecules/IconSelector";
import { ColorPicker } from "@/components/ui/molecules/ColorPicker";
import { ModalFooter } from "@/components/ui/molecules/ModalFooter";
import { PRESETS } from "../../types";

interface AddWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  addName: string;
  setAddName: (v: string) => void;
  addInitialBalance: string;
  setAddInitialBalance: (v: string) => void;
  addIcon: string;
  setAddIcon: (v: string) => void;
  addColor: string;
  setAddColor: (v: string) => void;
  addIsDefault: boolean;
  setAddIsDefault: (v: boolean) => void;
  isSubmitting: boolean;
}

export function AddWalletModal({
  isOpen,
  onClose,
  onSubmit,
  addName,
  setAddName,
  addInitialBalance,
  setAddInitialBalance,
  addIcon,
  setAddIcon,
  addColor,
  setAddColor,
  addIsDefault,
  setAddIsDefault,
  isSubmitting
}: AddWalletModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tambah Dompet Baru"
      onSubmit={onSubmit}
      footer={
        <ModalFooter
          onCancel={onClose}
          isSubmitting={isSubmitting}
          submitText="Tambah Dompet"
        />
      }
    >
      <div className="space-y-6">
        <FormField
          label="Nama Dompet"
          required
        >
          <Input
            type="text"
            value={addName}
            onChange={(e) => setAddName(e.target.value)}
            placeholder="Contoh: Dompet Utama, GoPay, BCA"
          />
        </FormField>

        <FormField
          label="Saldo Awal (Rupiah)"
          helperText="Saldo awal tidak bisa diubah setelah dibuat. Saldo saat ini akan otomatis disesuaikan."
        >
          <CurrencyInput
            value={addInitialBalance}
            onChange={(e) => setAddInitialBalance(e.target.value)}
            placeholder="0"
          />
        </FormField>

        <IconSelector
          icons={PRESETS.icons}
          selected={addIcon}
          onSelect={setAddIcon}
          label="Pilih Ikon"
        />

        <ColorPicker
          colors={PRESETS.colors}
          selected={addColor}
          onSelect={setAddColor}
          label="Warna Dompet"
          allowCustom
        />

        {/* Set as Default checkbox */}
        <Checkbox
          id="addIsDefault"
          checked={addIsDefault}
          onChange={(e) => setAddIsDefault(e.target.checked)}
          label="Jadikan sebagai dompet utama"
        />
      </div>
    </Modal>
  );
}

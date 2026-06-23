import { Modal } from "@/components/ui/organisms/Modal";
import { FormField } from "@/components/ui/molecules/FormField";
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
          type="text"
          value={addName}
          onChange={(e) => setAddName(e.target.value)}
          placeholder="Contoh: Dompet Utama, GoPay, BCA"
        />

        <FormField
          label="Saldo Awal (Rupiah)"
          type="currency"
          value={addInitialBalance}
          onChange={(e) => setAddInitialBalance(e.target.value)}
          placeholder="0"
          helperText="Saldo awal tidak bisa diubah setelah dibuat. Saldo saat ini akan otomatis disesuaikan."
        />

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
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="addIsDefault"
            checked={addIsDefault}
            onChange={(e) => setAddIsDefault(e.target.checked)}
            className="rounded border-border text-primary focus:border-border-strong focus:ring-0 w-4 h-4 bg-surface-input cursor-pointer transition-all duration-150 ease"
          />
          <label htmlFor="addIsDefault" className="text-body text-text-secondary select-none cursor-pointer">
            Jadikan sebagai dompet utama
          </label>
        </div>
      </div>
    </Modal>
  );
}

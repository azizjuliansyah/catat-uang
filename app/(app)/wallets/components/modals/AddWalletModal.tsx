import { Modal } from "@/components/ui/organisms/Modal";
import { FormField } from "@/components/ui/molecules/FormField";
import { Button } from "@/components/ui/atoms/Button";
import { ActionButton } from "@/components/ui/atoms/ActionButton";
import { getIconComponent } from "@/lib/utils/icons";
import { PRESETS } from "../../types";
import { Check } from "lucide-react";

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
        <>
          <Button type="button" variant="ghost" size="sm" fullWidth onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting} fullWidth>
            Simpan
          </Button>
        </>
      }
    >
      <div className="space-y-4">
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

        {/* Icon Selector Grid */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-text-secondary">Pilih Ikon</label>
          <div className="grid grid-cols-7 gap-2">
            {PRESETS.icons.map((iconName) => {
              const IconComp = getIconComponent(iconName);
              const isSelected = addIcon === iconName;
              return (
                <ActionButton
                  key={iconName}
                  icon={IconComp}
                  title={iconName}
                  variant="ghost"
                  size="sm"
                  onClick={() => setAddIcon(iconName)}
                  className={isSelected
                    ? "!bg-primary !border-primary !text-white hover:!bg-primary-hover"
                    : "bg-surface-input border border-border hover:border-border-strong"}
                  />
                );
            })}
          </div>
        </div>

        {/* Color Selector Picker */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-text-secondary">Warna Dompet</label>
          <div className="flex flex-wrap gap-2 items-center">
            {PRESETS.colors.map((color) => {
              const isSelected = addColor === color.hex;
              return (
                <Button
                  key={color.hex}
                  type="button"
                  variant="ghost"
                  onClick={() => setAddColor(color.hex)}
                  style={{ backgroundColor: color.hex }}
                  className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer relative min-h-0 h-auto p-0 ${isSelected ? "border-white scale-110 shadow-lg" : "border-transparent"
                    }`}
                  title={color.name}
                >
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-white absolute inset-0 m-auto" />
                  )}
                </Button>
              );
            })}

            {/* Custom color input */}
            <div className="flex items-center gap-1.5 ml-auto border border-border bg-surface-input px-2.5 py-1.5 rounded-xl">
              <input
                type="color"
                value={addColor}
                onChange={(e) => setAddColor(e.target.value)}
                className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
              />
              <input
                type="text"
                value={addColor.toUpperCase()}
                onChange={(e) => setAddColor(e.target.value)}
                placeholder="#0C5CAB"
                className="bg-transparent border-0 outline-none w-16 text-[10px] font-mono text-text-primary text-right"
              />
            </div>
          </div>
        </div>

        {/* Set as Default checkbox */}
        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="addIsDefault"
            checked={addIsDefault}
            onChange={(e) => setAddIsDefault(e.target.checked)}
            className="rounded border-border text-primary focus:ring-primary w-4 h-4 bg-surface-input cursor-pointer"
          />
          <label htmlFor="addIsDefault" className="text-xs font-semibold text-text-secondary select-none cursor-pointer">
            Jadikan sebagai dompet utama (Utama)
          </label>
        </div>
      </div>
    </Modal>
  );
}

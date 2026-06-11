import { Modal } from "@/components/ui/organisms/Modal";
import { FormField } from "@/components/ui/molecules/FormField";
import { Button } from "@/components/ui/atoms/Button";
import { ActionButton } from "@/components/ui/atoms/ActionButton";
import { getIconComponent } from "@/lib/utils/icons";
import { PRESETS, WalletItem } from "../../types";
import { Check } from "lucide-react";

interface EditWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  editingWallet: WalletItem | null;
  editName: string;
  setEditName: (v: string) => void;
  editIcon: string;
  setEditIcon: (v: string) => void;
  editColor: string;
  setEditColor: (v: string) => void;
  editIsDefault: boolean;
  setEditIsDefault: (v: boolean) => void;
  isSubmitting: boolean;
}

export function EditWalletModal({
  isOpen,
  onClose,
  onSubmit,
  editingWallet,
  editName,
  setEditName,
  editIcon,
  setEditIcon,
  editColor,
  setEditColor,
  editIsDefault,
  setEditIsDefault,
  isSubmitting
}: EditWalletModalProps) {
  const canSetDefault = editingWallet && !editingWallet.is_default && !editingWallet.is_archived;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Dompet: ${editingWallet?.name}`}
      onSubmit={onSubmit}
      footer={
        <>
          <Button type="button" variant="ghost" size="sm" onClick={onClose} className="flex-1">
            Batal
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting} className="flex-1">
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
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
        />

        {/* Icon Selector Grid */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-text-secondary">Pilih Ikon</label>
          <div className="grid grid-cols-7 gap-2">
            {PRESETS.icons.map((iconName) => {
              const IconComp = getIconComponent(iconName);
              const isSelected = editIcon === iconName;
              return (
                <ActionButton
                  key={iconName}
                  icon={IconComp}
                  title={iconName}
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditIcon(iconName)}
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
              const isSelected = editColor === color.hex;
              return (
                <Button
                  key={color.hex}
                  type="button"
                  variant="ghost"
                  onClick={() => setEditColor(color.hex)}
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
                value={editColor}
                onChange={(e) => setEditColor(e.target.value)}
                className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
              />
              <input
                type="text"
                value={editColor.toUpperCase()}
                onChange={(e) => setEditColor(e.target.value)}
                placeholder="#0C5CAB"
                className="bg-transparent border-0 outline-none w-16 text-[10px] font-mono text-text-primary text-right"
              />
            </div>
          </div>
        </div>

        {/* Set as Default checkbox */}
        {canSetDefault && (
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="editIsDefault"
              checked={editIsDefault}
              onChange={(e) => setEditIsDefault(e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary w-4 h-4 bg-surface-input cursor-pointer"
            />
            <label htmlFor="editIsDefault" className="text-xs font-semibold text-text-secondary select-none cursor-pointer">
              Jadikan sebagai dompet utama (Utama)
            </label>
          </div>
        )}
      </div>
    </Modal>
  );
}

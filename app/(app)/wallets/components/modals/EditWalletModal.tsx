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
          <Button type="button" variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Simpan
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <FormField
          label="Nama Dompet"
          required
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
        />

        {/* Icon Selector Grid */}
        <div className="space-y-3">
          <label className="text-label text-text-secondary block">Pilih Ikon</label>
          <div className="grid grid-cols-7 gap-2">
            {PRESETS.icons.map((iconName) => {
              const IconComp = getIconComponent(iconName);
              const isSelected = editIcon === iconName;
              return (
                <ActionButton
                  key={iconName}
                  icon={IconComp}
                  title={iconName}
                  variant={isSelected ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => setEditIcon(iconName)}
                  style={isSelected ? { backgroundColor: "var(--color-accent-primary)", color: "white" } : undefined}
                  className={isSelected ? "!border-primary" : ""}
                />
              );
            })}
          </div>
        </div>

        {/* Color Selector Picker */}
        <div className="space-y-3">
          <label className="text-label text-text-secondary block">Warna Dompet</label>
          <div className="flex flex-wrap gap-2 items-center">
            {PRESETS.colors.map((color) => {
              const isSelected = editColor === color.hex;
              return (
                <button
                  key={color.hex}
                  type="button"
                  onClick={() => setEditColor(color.hex)}
                  className={`
                    w-8 h-8 rounded-full border-2 transition-all duration-150 ease relative
                    ${isSelected ? "scale-110 shadow-md" : ""}
                  `}
                  style={{
                    backgroundColor: color.hex,
                    borderColor: isSelected ? "var(--color-border-strong)" : "transparent",
                  }}
                  title={color.name}
                >
                  {isSelected && (
                    <Check className="w-4 h-4 text-white absolute inset-0 m-auto" />
                  )}
                </button>
              );
            })}

            {/* Custom color input */}
            <div className="flex items-center gap-2 ml-auto border border-border bg-surface-hover px-3 py-2 rounded-md">
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
                className="bg-transparent border-0 outline-none w-16 text-caption font-mono text-text-primary text-right uppercase"
              />
            </div>
          </div>
        </div>

        {/* Set as Default checkbox */}
        {canSetDefault && (
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="editIsDefault"
              checked={editIsDefault}
              onChange={(e) => setEditIsDefault(e.target.checked)}
              className="rounded border-border text-primary focus:border-border-strong focus:ring-0 w-4 h-4 bg-surface-input cursor-pointer transition-all duration-150 ease"
            />
            <label htmlFor="editIsDefault" className="text-body text-text-secondary select-none cursor-pointer">
              Jadikan sebagai dompet utama
            </label>
          </div>
        )}
      </div>
    </Modal>
  );
}

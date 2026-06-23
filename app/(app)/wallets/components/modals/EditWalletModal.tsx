import { Modal } from "@/components/ui/organisms/Modal";
import { FormField } from "@/components/ui/molecules/FormField";
import { IconSelector } from "@/components/ui/molecules/IconSelector";
import { ColorPicker } from "@/components/ui/molecules/ColorPicker";
import { ModalFooter } from "@/components/ui/molecules/ModalFooter";
import { PRESETS, WalletItem } from "../../types";

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
        <ModalFooter
          onCancel={onClose}
          isSubmitting={isSubmitting}
          submitText="Simpan Perubahan"
        />
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

        <IconSelector
          icons={PRESETS.icons}
          selected={editIcon}
          onSelect={setEditIcon}
          label="Pilih Ikon"
        />

        <ColorPicker
          colors={PRESETS.colors}
          selected={editColor}
          onSelect={setEditColor}
          label="Warna Dompet"
          allowCustom
        />

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

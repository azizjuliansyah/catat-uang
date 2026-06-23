import React from "react";
import { Modal } from "@/components/ui/organisms/Modal";
import { ModalFooter } from "@/components/ui/molecules/ModalFooter";
import { FormField } from "@/components/ui/molecules/FormField";
import { ActionButton } from "@/components/ui/atoms/ActionButton";
import { getIconComponent } from "@/lib/utils/icons";
import { Check } from "lucide-react";
import { AdminCategoriesState } from "../hooks/useAdminCategoriesState";

interface CategoryTemplateModalsProps {
  state: AdminCategoriesState;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleDeleteConfirm: () => Promise<void>;
}

const PRESET_COLORS = [
  { name: "Emerald", hex: "#10B981" },
  { name: "Blue", hex: "#3B82F6" },
  { name: "Indigo", hex: "#6366F1" },
  { name: "Purple", hex: "#8B5CF6" },
  { name: "Pink", hex: "#EC4899" },
  { name: "Red", hex: "#EF4444" },
  { name: "Orange", hex: "#F59E0B" },
  { name: "Gray", hex: "#6B7280" }
];

const PRESET_ICONS = [
  "Briefcase",
  "TrendingUp",
  "Utensils",
  "Car",
  "ShoppingBag",
  "FileText",
  "Film",
  "HelpCircle"
];

export function CategoryTemplateModals({
  state,
  handleSubmit,
  handleDeleteConfirm
}: CategoryTemplateModalsProps) {
  const {
    isModalOpen,
    setIsModalOpen,
    editingTemplate,
    templateToDelete,
    setTemplateToDelete,
    formName,
    setFormName,
    formType,
    setFormType,
    formIcon,
    setFormIcon,
    formColor,
    setFormColor,
    submitting,
    deleting
  } = state;

  return (
    <>
      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTemplate ? "Sunting Template Kategori" : "Buat Template Kategori Baru"}
        onSubmit={handleSubmit}
        footer={
          <ModalFooter
            onCancel={() => setIsModalOpen(false)}
            isSubmitting={submitting}
            submitText="Simpan"
          />
        }
      >
        <div className="space-y-4">
          <FormField
            label="Nama Template"
            required
            type="text"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="Contoh: Belanja Bulanan, Gaji, Makan Luar"
          />

          {/* Type Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
              Jenis Kategori
              <span className="text-danger">*</span>
            </label>
            <div className="flex gap-2 bg-surface-input/30 border border-border p-1.5 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setFormType("expense");
                  if (formColor === "#10B981") setFormColor("#EF4444");
                }}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  formType === "expense"
                    ? "bg-danger text-white"
                    : "text-text-secondary hover:bg-surface-hover"
                }`}
              >
                Pengeluaran
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormType("income");
                  if (formColor === "#EF4444") setFormColor("#10B981");
                }}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  formType === "income"
                    ? "bg-success text-white"
                    : "text-text-secondary hover:bg-surface-hover"
                }`}
              >
                Pemasukan
              </button>
            </div>
          </div>

          {/* Icon Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
              Pilih Ikon
              <span className="text-danger">*</span>
            </label>
            <div className="grid grid-cols-4 gap-2 bg-surface-input/30 border border-border p-3 rounded-xl">
              {PRESET_ICONS.map((iconName) => {
                const IconComp = getIconComponent(iconName);
                return (
                  <ActionButton
                    key={iconName}
                    icon={IconComp}
                    title={iconName}
                    variant="ghost"
                    size="sm"
                    isSelected={formIcon === iconName}
                    selectedColor="var(--color-primary)"
                    onClick={() => setFormIcon(iconName)}
                  />
                );
              })}
            </div>
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
              Pilih Warna
              <span className="text-danger">*</span>
            </label>
            <div className="flex flex-wrap gap-2 bg-surface-input/30 border border-border p-3 rounded-xl">
              {PRESET_COLORS.map((col) => {
                const isSelected = formColor.toLowerCase() === col.hex.toLowerCase();
                return (
                  <Button
                    key={col.hex}
                    type="button"
                    variant="ghost"
                    onClick={() => setFormColor(col.hex)}
                    className={`w-7 h-7 p-0 min-h-0 rounded-full transition-all cursor-pointer flex items-center justify-center border-2 border-transparent ${
                      isSelected
                        ? "border-text-primary scale-110"
                        : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: col.hex }}
                    title={col.name}
                  >
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />
                    )}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={templateToDelete !== null}
        onClose={() => setTemplateToDelete(null)}
        title="Hapus Template Kategori"
        isDestructive
        footer={
          <ModalFooter
            onCancel={() => setTemplateToDelete(null)}
            onSubmit={handleDeleteConfirm}
            isSubmitting={deleting}
            cancelText="Batal"
            submitText="Hapus"
            variant="destructive"
          />
        }
      >
        <p className="text-xs text-text-secondary">
          Apakah Anda yakin ingin menghapus template kategori{" "}
          <span className="font-bold text-text-primary">
            "{templateToDelete?.name}"
          </span>
          ? Aksi ini tidak dapat dibatalkan.
        </p>
      </Modal>
    </>
  );
}

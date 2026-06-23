"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useApp } from "@/app/providers/AppProvider";
import { useToast } from "@/components/ui/molecules/Toast";
import { FormField } from "@/components/ui/molecules/FormField";
import { Modal } from "@/components/ui/organisms/Modal";
import { ModalFooter } from "@/components/ui/molecules/ModalFooter";
import { ActionButton } from "@/components/ui/atoms/ActionButton";
import { getIconComponent } from "@/lib/utils/icons";
import { Check } from "lucide-react";
import { Category } from "../../types";
import { createCategory, updateCategory } from "../../services";
import { getErrorMessage, CATEGORY_PRESETS } from "../../utils";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingCategory: Category | null;
  categoryType: "expense" | "income";
  onSaveSuccess: () => void;
}

export function CategoryModal({
  isOpen,
  onClose,
  editingCategory,
  categoryType,
  onSaveSuccess
}: CategoryModalProps) {
  const supabase = createClient();
  const { user } = useApp();
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  const [catName, setCatName] = useState("");
  const [catIcon, setCatIcon] = useState("HelpCircle");
  const [catColor, setCatColor] = useState("#10B981");
  const [catSubmitting, setCatSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editingCategory) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCatName(editingCategory.name);
        setCatIcon(editingCategory.icon);
        setCatColor(editingCategory.color);
      } else {
        setCatName("");
        setCatIcon("HelpCircle");
        setCatColor(categoryType === "expense" ? "#EF4444" : "#10B981");
      }
    }
  }, [isOpen, editingCategory, categoryType]);

  async function handleCategorySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    if (!catName.trim()) {
      showErrorToast("Nama kategori wajib diisi");
      return;
    }

    setCatSubmitting(true);
    try {
      if (editingCategory) {
        await updateCategory(supabase, editingCategory.id, {
          name: catName,
          icon: catIcon,
          color: catColor
        });
        showSuccessToast(`Kategori "${catName}" berhasil diperbarui!`);
      } else {
        await createCategory(supabase, user.id, {
          name: catName,
          type: categoryType,
          icon: catIcon,
          color: catColor
        });
        showSuccessToast(`Kategori "${catName}" berhasil ditambahkan!`);
      }

      onSaveSuccess();
      onClose();
    } catch (err: unknown) {
      console.error("Error saving category:", err);
      showErrorToast("Gagal menyimpan kategori: " + getErrorMessage(err));
    } finally {
      setCatSubmitting(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingCategory ? "Sunting Kategori" : "Buat Kategori Baru"}
      onSubmit={handleCategorySubmit}
      footer={
        <ModalFooter
          onCancel={onClose}
          isSubmitting={catSubmitting}
          submitText="Simpan"
        />
      }
    >
      <div className="space-y-4">
        <FormField
          label="Nama Kategori"
          required
          type="text"
          value={catName}
          onChange={(e) => setCatName(e.target.value)}
          placeholder="Contoh: Belanja Bulanan, Gaji, Makan Luar"
        />

        {/* Icon Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
            Pilih Ikon
            <span className="text-danger">*</span>
          </label>
          <div className="grid grid-cols-4 gap-2 bg-surface-input/30 border border-border p-3 rounded-xl">
            {CATEGORY_PRESETS.icons.map((iconName) => {
              const IconComp = getIconComponent(iconName);
              return (
                <ActionButton
                  key={iconName}
                  icon={IconComp}
                  title={iconName}
                  variant="ghost"
                  size="sm"
                  isSelected={catIcon === iconName}
                  selectedColor="var(--color-primary)"
                  onClick={() => setCatIcon(iconName)}
                />
              );
            })}
          </div>
        </div>

        {/* Color Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
            Pilih Warna Kategori
            <span className="text-danger">*</span>
          </label>
          <div className="flex flex-wrap gap-2 bg-surface-input/30 border border-border p-3 rounded-xl">
            {CATEGORY_PRESETS.colors.map((col) => {
              const isSelected = catColor.toLowerCase() === col.hex.toLowerCase();
              return (
                <Button
                  key={col.hex}
                  type="button"
                  variant="ghost"
                  onClick={() => setCatColor(col.hex)}
                  className={`w-7 h-7 p-0 min-h-0 rounded-full transition-all cursor-pointer flex items-center justify-center border-2 border-transparent ${isSelected
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
  );
}

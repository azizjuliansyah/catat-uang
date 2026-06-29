"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useApp } from "@/app/providers/AppProvider";
import { useToast } from "@/components/ui/molecules/Toast";
import { FormField } from "@/components/ui/molecules/FormField";
import { Modal } from "@/components/ui/organisms/Modal";
import { ModalFooter } from "@/components/ui/molecules/ModalFooter";
import { IconSelector } from "@/components/ui/molecules/IconSelector";
import { ColorPicker } from "@/components/ui/molecules/ColorPicker";
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
      title={editingCategory ? "Edit Kategori" : "Buat Kategori Baru"}
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

        <IconSelector
          icons={CATEGORY_PRESETS.icons}
          selected={catIcon}
          onSelect={setCatIcon}
          label="Pilih Ikon"
          required
          columns={4}
        />

        <ColorPicker
          colors={CATEGORY_PRESETS.colors}
          selected={catColor}
          onSelect={setCatColor}
          label="Pilih Warna Kategori"
          required
          allowCustom={false}
          columns={4}
        />
      </div>
    </Modal>
  );
}

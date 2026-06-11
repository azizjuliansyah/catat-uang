"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/molecules/Toast";
import { DeleteConfirmationModal } from "@/components/ui/organisms/DeleteConfirmationModal";
import { Trash2 } from "lucide-react";

interface Category {
  id: string;
  user_id: string;
  name: string;
  type: "income" | "expense";
  icon: string;
  color: string;
  created_at: string;
}

interface DeleteCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToDelete: Category | null;
  onDeleteSuccess: () => void;
}

export function DeleteCategoryModal({
  isOpen,
  onClose,
  categoryToDelete,
  onDeleteSuccess
}: DeleteCategoryModalProps) {
  const supabase = createClient();
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  const [deletingCat, setDeletingCat] = useState(false);

  function getErrorMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    return String(err);
  }

  // Handle Delete Category
  async function handleCategoryDelete() {
    if (!categoryToDelete) return;

    setDeletingCat(true);
    try {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", categoryToDelete.id);

      if (error) throw error;

      showSuccessToast(`Kategori "${categoryToDelete.name}" berhasil dihapus.`);
      onDeleteSuccess();
      onClose();
    } catch (err: unknown) {
      console.error("Error deleting category:", err);
      showErrorToast("Gagal menghapus kategori: " + getErrorMessage(err));
    } finally {
      setDeletingCat(false);
    }
  }

  return (
    <DeleteConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      title="Hapus Kategori?"
      onConfirm={handleCategoryDelete}
      isSubmitting={deletingCat}
      icon={Trash2}
    >
      Apakah Anda yakin ingin menghapus kategori{" "}
      <span className="font-bold text-text-primary">{categoryToDelete?.name}</span>?
      <br />
      <br />
      Semua catatan transaksi yang berhubungan akan disetel tanpa kategori (&quot;Lainnya&quot;). Tindakan ini tidak dapat dibatalkan.
    </DeleteConfirmationModal>
  );
}

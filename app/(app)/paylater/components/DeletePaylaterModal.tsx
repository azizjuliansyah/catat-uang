"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/molecules/Toast";
import { DeleteConfirmationModal } from "@/components/ui/organisms/DeleteConfirmationModal";
import { Trash2 } from "lucide-react";
import { deletePaylaterPlatform } from "../services";
import { PaylaterPlatform } from "../types";
import { getErrorMessage } from "../utils";

interface DeletePaylaterModalProps {
  isOpen: boolean;
  onClose: () => void;
  platformToDelete: PaylaterPlatform | null;
  onDeleteSuccess: () => void;
}

export function DeletePaylaterModal({
  isOpen,
  onClose,
  platformToDelete,
  onDeleteSuccess
}: DeletePaylaterModalProps) {
  const supabase = createClient();
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!platformToDelete) return;

    setDeleting(true);
    try {
      await deletePaylaterPlatform(supabase, platformToDelete.id);

      showSuccessToast(`Platform "${platformToDelete.name}" berhasil dihapus.`);
      onDeleteSuccess();
      onClose();
    } catch (err: unknown) {
      console.error("Error deleting paylater platform:", err);
      showErrorToast("Gagal menghapus platform: " + getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <DeleteConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      title="Hapus Platform Paylater?"
      onConfirm={handleDelete}
      isSubmitting={deleting}
      icon={Trash2}
    >
      Apakah Anda yakin ingin menghapus platform Paylater{" "}
      <span className="font-bold text-text-primary">{platformToDelete?.name}</span>?
      <br />
      <br />
      Semua data transaksi terkait platform ini akan disetel tanpa platform Paylater. Tindakan ini tidak dapat dibatalkan.
    </DeleteConfirmationModal>
  );
}

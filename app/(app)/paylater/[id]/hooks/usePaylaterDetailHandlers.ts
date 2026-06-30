/**
 * PayLater Detail Page Handlers Hook
 * Handles all server operations for the paylater detail page
 */

import { createClient } from "@/lib/supabase/client";
import { useApp } from "@/app/providers/AppProvider";
import { useToast } from "@/components/ui/molecules/Toast";
import { deletePaylaterPayment, toggleArchivePaylaterPlatform } from "../../services";
import { PaylaterPayment, PaylaterPlatform } from "../../types";

interface UsePaylaterDetailHandlersProps {
  paymentToDelete: PaylaterPayment | null;
  setPaymentToDelete: (value: PaylaterPayment | null) => void;
  loadData: () => Promise<void>;
  platform: PaylaterPlatform | null;
  setIsEditModalOpen: (val: boolean) => void;
  setIsDeleteModalOpen: (val: boolean) => void;
  setIsActionLoading: (val: boolean) => void;
}

export function usePaylaterDetailHandlers({
  paymentToDelete,
  setPaymentToDelete,
  loadData,
  platform,
  setIsEditModalOpen,
  setIsDeleteModalOpen,
  setIsActionLoading
}: UsePaylaterDetailHandlersProps) {
  const supabase = createClient();
  const { refreshWallets, refreshPaylaterPlatforms } = useApp();
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  // Handle payment success
  const handlePaymentSuccess = async () => {
    await loadData();
    await refreshWallets();
    await refreshPaylaterPlatforms();
  };

  // Handle delete payment
  const handleDeletePayment = async () => {
    if (!paymentToDelete) return;
    try {
      await deletePaylaterPayment(supabase, paymentToDelete.id, paymentToDelete.transaction_id);

      showSuccessToast("Pembayaran berhasil dihapus");
      setPaymentToDelete(null);
      await loadData();
      await refreshWallets();
      await refreshPaylaterPlatforms();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      showErrorToast("Gagal menghapus pembayaran: " + message);
    }
  };

  // Archive/Unarchive handler
  const handleToggleArchive = async () => {
    if (!platform) return;
    setIsActionLoading(true);
    try {
      const nextArchived = !platform.is_archived;
      await toggleArchivePaylaterPlatform(supabase, platform.id, nextArchived);
      showSuccessToast(nextArchived ? "Platform berhasil diarsipkan" : "Platform berhasil diaktifkan kembali");
      await loadData();
    } catch (err) {
      console.error(err);
      showErrorToast("Gagal mengubah status arsip platform");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    loadData();
  };

  const handleDeleteSuccess = (router: any) => {
    setIsDeleteModalOpen(false);
    router.push("/paylater");
  };

  return {
    handlePaymentSuccess,
    handleDeletePayment,
    handleToggleArchive,
    handleEditSuccess,
    handleDeleteSuccess
  };
}

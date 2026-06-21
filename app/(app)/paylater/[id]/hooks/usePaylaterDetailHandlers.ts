/**
 * PayLater Detail Page Handlers Hook
 * Handles all server operations for the paylater detail page
 */

import { createClient } from "@/lib/supabase/client";
import { useApp } from "@/app/providers/AppProvider";
import { useToast } from "@/components/ui/molecules/Toast";
import { PaylaterPayment } from "../types";

interface UsePaylaterDetailHandlersProps {
  paymentToDelete: PaylaterPayment | null;
  setPaymentToDelete: (value: PaylaterPayment | null) => void;
  loadData: () => Promise<void>;
}

export function usePaylaterDetailHandlers({
  paymentToDelete,
  setPaymentToDelete,
  loadData
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
      const txId = paymentToDelete.transaction_id;

      const { error: deletePaymentError } = await supabase
        .from("paylater_payments")
        .delete()
        .eq("id", paymentToDelete.id);

      if (deletePaymentError) throw deletePaymentError;

      if (txId) {
        const { error: deleteTxError } = await supabase
          .from("transactions")
          .delete()
          .eq("id", txId);
        if (deleteTxError) throw deleteTxError;
      }

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

  return {
    handlePaymentSuccess,
    handleDeletePayment
  };
}

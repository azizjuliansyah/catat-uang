import { WalletDetailState } from "./useWalletDetailState";
import { Transaction } from "../types";
import { deleteWallet, toggleArchiveWallet, setDefaultWallet } from "../../services";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/molecules/Toast";

export function useWalletDetailHandlers(state: WalletDetailState) {
  const {
    setSelectedTransaction,
    setIsDetailModalOpen,
    setIsDeleteModalOpen,
    setIsDeleteSubmitting,
    setIsActionLoading,
    router,
    wallet,
  } = state;

  const supabase = createClient();
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  const handleTransactionClick = (tx: Transaction) => {
    setSelectedTransaction(tx);
    setIsDetailModalOpen(true);
  };

  const handleModalClose = () => {
    setIsDetailModalOpen(false);
    setSelectedTransaction(null);
  };

  const handleEditTransaction = (tx: Transaction) => {
    router.push(`/transactions/${tx.id}`);
  };

  const formatDateGroup = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleToggleArchive = async () => {
    if (!wallet) return;
    setIsActionLoading(true);
    try {
      const nextArchived = !wallet.is_archived;
      if (wallet.is_default && nextArchived) {
        showErrorToast("Dompet utama tidak bisa diarsipkan.");
        setIsActionLoading(false);
        return;
      }
      await toggleArchiveWallet(supabase, wallet.id, nextArchived);
      showSuccessToast(nextArchived ? "Dompet berhasil diarsipkan" : "Dompet berhasil diaktifkan kembali");
    } catch (err) {
      console.error(err);
      showErrorToast("Gagal mengubah status arsip dompet");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSetDefault = async () => {
    if (!wallet) return;
    setIsActionLoading(true);
    try {
      if (wallet.is_archived) {
        showErrorToast("Dompet terarsip tidak bisa dijadikan dompet utama.");
        setIsActionLoading(false);
        return;
      }
      await setDefaultWallet(supabase, wallet.id);
      showSuccessToast(`Dompet ${wallet.name} sekarang menjadi dompet utama!`);
    } catch (err) {
      console.error(err);
      showErrorToast("Gagal menjadikan dompet utama");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteWallet = async () => {
    if (!wallet) return;
    setIsDeleteSubmitting(true);
    try {
      await deleteWallet(supabase, wallet.id);
      setIsDeleteModalOpen(false);
      router.push("/wallets");
    } catch (err) {
      console.error(err);
      setIsDeleteSubmitting(false);
    }
  };

  return {
    handleTransactionClick,
    handleModalClose,
    handleEditTransaction,
    formatDateGroup,
    handleToggleArchive,
    handleSetDefault,
    handleDeleteWallet,
  };
}

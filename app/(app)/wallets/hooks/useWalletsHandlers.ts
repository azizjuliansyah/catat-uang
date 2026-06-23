import React from "react";
import { useToast } from "@/components/ui/molecules/Toast";
import { WalletItem } from "../types";
import { formatIDR } from "../utils";
import {
  addWallet,
  updateWallet,
  toggleArchiveWallet as toggleArchiveWalletSvc,
  setDefaultWallet as setDefaultWalletSvc,
  deleteWallet as deleteWalletSvc,
  createTransfer
} from "../services";

interface UseWalletsHandlersProps {
  user: any;
  wallets: WalletItem[];
  refreshWallets: () => Promise<void>;

  // State setters
  setIsAddModalOpen: (open: boolean) => void;
  setIsEditModalOpen: (open: boolean) => void;
  setIsTransferModalOpen: (open: boolean) => void;
  setWalletToDelete: (wallet: WalletItem | null) => void;
  resetAddForm: () => void;

  // Add form state
  addName: string;
  addInitialBalance: string;
  addIcon: string;
  addColor: string;
  addIsDefault: boolean;
  setAddSubmitting: (submitting: boolean) => void;

  // Edit form state
  editingWallet: WalletItem | null;
  editName: string;
  editIcon: string;
  editColor: string;
  editIsDefault: boolean;
  setEditSubmitting: (submitting: boolean) => void;

  // Transfer form state
  tfSourceId: string;
  tfDestId: string;
  tfAmount: string;
  setTfAmount: (val: string) => void;
  tfDescription: string;
  setTfDescription: (val: string) => void;
  tfDate: string;
  setTfSubmitting: (submitting: boolean) => void;

  // Delete state
  setIsDeleteSubmitting: (submitting: boolean) => void;
  setOrderedWallets: React.Dispatch<React.SetStateAction<WalletItem[]>>;
}

export function useWalletsHandlers({
  user,
  wallets,
  refreshWallets,

  setIsAddModalOpen,
  setIsEditModalOpen,
  setIsTransferModalOpen,
  setWalletToDelete,
  resetAddForm,

  addName,
  addInitialBalance,
  addIcon,
  addColor,
  addIsDefault,
  setAddSubmitting,

  editingWallet,
  editName,
  editIcon,
  editColor,
  editIsDefault,
  setEditSubmitting,

  tfSourceId,
  tfDestId,
  tfAmount,
  setTfAmount,
  tfDescription,
  setTfDescription,
  tfDate,
  setTfSubmitting,

  setIsDeleteSubmitting,
  setOrderedWallets
}: UseWalletsHandlersProps) {
  const supabase = (require("@/lib/supabase/client")).createClient();
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  const fetchWallets = async () => {
    await refreshWallets();
  };

  // ADD WALLET
  const handleAddWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim()) {
      showErrorToast("Nama dompet tidak boleh kosong");
      return;
    }
    if (!user) return;

    try {
      setAddSubmitting(true);
      const newWallet = {
        user_id: user.id,
        name: addName.trim(),
        initial_balance: parseFloat(addInitialBalance) || 0,
        icon: addIcon,
        color: addColor,
        is_default: addIsDefault,
        is_archived: false
      };

      await addWallet(supabase, newWallet);

      showSuccessToast("Dompet baru berhasil ditambahkan!");
      setIsAddModalOpen(false);
      resetAddForm();
      await fetchWallets();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      showErrorToast("Gagal menambahkan dompet: " + message);
    } finally {
      setAddSubmitting(false);
    }
  };

  // EDIT WALLET
  const handleEditWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWallet) return;
    if (!editName.trim()) {
      showErrorToast("Nama dompet tidak boleh kosong");
      return;
    }

    try {
      setEditSubmitting(true);
      await updateWallet(supabase, editingWallet.id, {
        name: editName.trim(),
        icon: editIcon,
        color: editColor,
        is_default: editIsDefault
      });

      showSuccessToast("Perubahan dompet berhasil disimpan!");
      setIsEditModalOpen(false);
      await fetchWallets();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      showErrorToast("Gagal menyimpan perubahan: " + message);
    } finally {
      setEditSubmitting(false);
    }
  };

  // ARCHIVE / UNARCHIVE
  const toggleArchiveWallet = async (wallet: WalletItem) => {
    try {
      const nextArchived = !wallet.is_archived;
      if (wallet.is_default && nextArchived) {
        showErrorToast("Dompet utama tidak dapat diarsipkan. Ubah dompet utama terlebih dahulu.");
        return;
      }

      await toggleArchiveWalletSvc(supabase, wallet.id, nextArchived);

      showSuccessToast(nextArchived ? "Dompet berhasil diarsipkan" : "Dompet berhasil diaktifkan kembali");
      await fetchWallets();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      showErrorToast("Gagal merubah status arsip: " + message);
    }
  };

  // SET DEFAULT
  const setDefaultWallet = async (wallet: WalletItem) => {
    if (wallet.is_archived) {
      showErrorToast("Dompet terarsip tidak bisa dijadikan dompet utama.");
      return;
    }

    try {
      await setDefaultWalletSvc(supabase, wallet.id);

      showSuccessToast(`Dompet ${wallet.name} sekarang menjadi dompet utama!`);
      await fetchWallets();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      showErrorToast("Gagal menyetel dompet utama: " + message);
    }
  };

  // DELETE WALLET
  const handleDeleteWallet = async (walletToDelete: WalletItem | null) => {
    if (!walletToDelete) return;
    if (walletToDelete.is_default) {
      showErrorToast("Dompet utama tidak dapat dihapus");
      setWalletToDelete(null);
      return;
    }

    try {
      setIsDeleteSubmitting(true);
      await deleteWalletSvc(supabase, walletToDelete.id);

      showSuccessToast(`Dompet ${walletToDelete.name} berhasil dihapus`);
      setWalletToDelete(null);
      await fetchWallets();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      showErrorToast("Gagal menghapus dompet: " + message);
    } finally {
      setIsDeleteSubmitting(false);
    }
  };

  // TRANSFER SALDO
  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!tfSourceId || !tfDestId) {
      showErrorToast("Pilih dompet asal dan tujuan transfer");
      return;
    }
    if (tfSourceId === tfDestId) {
      showErrorToast("Dompet asal dan tujuan tidak boleh sama");
      return;
    }
    const amount = parseFloat(tfAmount);
    if (isNaN(amount) || amount <= 0) {
      showErrorToast("Jumlah transfer harus lebih dari 0");
      return;
    }

    // Check if source has sufficient funds
    const sourceWallet = wallets.find(w => w.id === tfSourceId);
    if (sourceWallet && Number(sourceWallet.balance) < amount) {
      if (!confirm(`Saldo dompet asal (${formatIDR(sourceWallet.balance)}) kurang dari jumlah transfer (${formatIDR(amount)}). Tetap lanjutkan?`)) {
        return;
      }
    }

    try {
      setTfSubmitting(true);
      const destWallet = wallets.find(w => w.id === tfDestId);
      const newTransfer = {
        user_id: user.id,
        from_wallet_id: tfSourceId,
        to_wallet_id: tfDestId,
        amount: amount,
        description: tfDescription.trim() || `Transfer dari ${sourceWallet?.name} ke ${destWallet?.name}`,
        transfer_date: new Date(tfDate).toISOString()
      };

      await createTransfer(supabase, newTransfer);

      showSuccessToast("Transfer saldo berhasil dilakukan!");
      setIsTransferModalOpen(false);
      setTfAmount("");
      setTfDescription("");
      await fetchWallets();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      showErrorToast("Gagal melakukan transfer: " + message);
    } finally {
      setTfSubmitting(false);
    }
  };

  // DRAG END HANDLER
  const handleDragEnd = (event: any, arrayMove: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setOrderedWallets((items: WalletItem[]) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      const updated = arrayMove(items, oldIndex, newIndex) as WalletItem[];

      // Save order to LocalStorage
      if (user) {
        const orderIds = updated.map((item: WalletItem) => item.id);
        localStorage.setItem(`wallet-order-${user.id}`, JSON.stringify(orderIds));
      }

      return updated;
    });
  };

  return {
    handleAddWallet,
    handleEditWallet,
    toggleArchiveWallet,
    setDefaultWallet,
    handleDeleteWallet,
    handleTransfer,
    handleDragEnd
  };
}

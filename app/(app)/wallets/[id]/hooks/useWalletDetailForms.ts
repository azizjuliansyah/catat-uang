import { useState, useCallback } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { useToast } from "@/components/ui/molecules/Toast";
import { WalletItem } from "../../types";
import { updateWallet, createTransfer } from "../../services";

interface UseWalletDetailFormsParams {
  wallet: WalletItem | null;
  userId: string | undefined;
  wallets: WalletItem[];
  supabase: SupabaseClient;
  onTransferSuccess: () => void;
}

export function useWalletDetailForms({
  wallet,
  userId,
  wallets,
  supabase,
  onTransferSuccess,
}: UseWalletDetailFormsParams) {
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("Wallet");
  const [editColor, setEditColor] = useState("#0C5CAB");
  const [editIsDefault, setEditIsDefault] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Transfer modal state
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  // Transfer form state
  const [tfSourceId, setTfSourceId] = useState("");
  const [tfDestId, setTfDestId] = useState("");
  const [tfAmount, setTfAmount] = useState("");
  const [tfDate, setTfDate] = useState(new Date().toISOString().split("T")[0]);
  const [tfDescription, setTfDescription] = useState("");
  const [isSubmittingTransfer, setIsSubmittingTransfer] = useState(false);

  // Open edit modal and initialize form state
  const handleOpenEditModal = useCallback(() => {
    if (!wallet) return;
    setEditName(wallet.name);
    setEditIcon(wallet.icon);
    setEditColor(wallet.color);
    setEditIsDefault(wallet.is_default);
    setIsEditModalOpen(true);
  }, [wallet]);

  // Edit wallet submit handler
  const handleEditWallet = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet) return;

    if (!editName.trim()) {
      showErrorToast("Nama dompet tidak boleh kosong");
      return;
    }

    setIsEditing(true);
    try {
      await updateWallet(supabase, wallet.id, {
        name: editName.trim(),
        icon: editIcon,
        color: editColor,
        is_default: editIsDefault
      });
      showSuccessToast("Perubahan dompet berhasil disimpan!");
      setIsEditModalOpen(false);
    } catch (err) {
      console.error(err);
      showErrorToast("Gagal menyimpan perubahan dompet");
    } finally {
      setIsEditing(false);
    }
  }, [wallet, supabase, editName, editIcon, editColor, editIsDefault, showSuccessToast, showErrorToast]);

  // Open transfer modal with current wallet as source
  const handleOpenTransferModal = useCallback(() => {
    if (!wallet) return;
    const activeWallets = wallets.filter(w => !w.is_archived && w.id !== wallet.id);
    setTfSourceId(wallet.id);
    setTfDestId(activeWallets[0]?.id || "");
    setTfAmount("");
    setTfDate(new Date().toISOString().split("T")[0]);
    setTfDescription("");
    setIsTransferModalOpen(true);
  }, [wallet, wallets]);

  // Transfer submit handler
  const handleTransferSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    const amount = parseFloat(tfAmount);
    if (isNaN(amount) || amount <= 0) {
      showErrorToast("Jumlah transfer harus lebih dari 0");
      return;
    }

    if (tfSourceId === tfDestId) {
      showErrorToast("Dompet asal dan tujuan tidak boleh sama");
      return;
    }

    setIsSubmittingTransfer(true);
    try {
      await createTransfer(supabase, {
        user_id: userId,
        from_wallet_id: tfSourceId,
        to_wallet_id: tfDestId,
        amount,
        description: tfDescription || `Transfer dari ${wallets.find(w => w.id === tfSourceId)?.name}`,
        transfer_date: tfDate
      });
      showSuccessToast("Transfer berhasil!");
      setIsTransferModalOpen(false);
      onTransferSuccess();
    } catch (err) {
      console.error(err);
      showErrorToast("Gagal melakukan transfer");
    } finally {
      setIsSubmittingTransfer(false);
    }
  }, [userId, tfAmount, tfSourceId, tfDestId, tfDescription, tfDate, wallets, supabase, onTransferSuccess, showSuccessToast, showErrorToast]);

  return {
    // Edit modal
    isEditModalOpen,
    setIsEditModalOpen,
    editName,
    setEditName,
    editIcon,
    setEditIcon,
    editColor,
    setEditColor,
    editIsDefault,
    setEditIsDefault,
    isEditing,
    handleOpenEditModal,
    handleEditWallet,

    // Transfer modal
    isTransferModalOpen,
    setIsTransferModalOpen,
    tfSourceId,
    setTfSourceId,
    tfDestId,
    setTfDestId,
    tfAmount,
    setTfAmount,
    tfDate,
    setTfDate,
    tfDescription,
    setTfDescription,
    isSubmittingTransfer,
    handleOpenTransferModal,
    handleTransferSubmit,
  };
}

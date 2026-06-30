import { useToast } from "@/components/ui/molecules/Toast";
import { WishlistItem } from "../types";

interface UseWishlistHandlersProps {
  user: any;
  createWishlist: (data: {
    user_id: string;
    name: string;
    qty: number;
    price: number;
    target_date: string | null;
    description: string | null;
  }) => Promise<void>;
  updateWishlist: (id: string, data: {
    name: string;
    qty: number;
    price: number;
    target_date: string | null;
    description: string | null;
  }) => Promise<void>;
  deleteWishlist: (id: string) => Promise<void>;
  purchaseItem: (id: string, walletId: string) => Promise<void>;
  unpurchaseItem: (id: string) => Promise<void>;
  closeAllModals: () => void;
  resetForm: () => void;
  setSubmittingWishlist: (submitting: boolean) => void;
  setIsDeleteSubmitting: (submitting: boolean) => void;
  setSubmittingToggle: (submitting: boolean) => void;
}

export function useWishlistHandlers({
  user,
  createWishlist,
  updateWishlist,
  deleteWishlist,
  purchaseItem,
  unpurchaseItem,
  closeAllModals,
  resetForm,
  setSubmittingWishlist,
  setIsDeleteSubmitting,
  setSubmittingToggle
}: UseWishlistHandlersProps) {
  const { error: showErrorToast } = useToast();

  const handleSaveWishlist = async (
    e: React.FormEvent,
    formName: string,
    formQty: string,
    formPrice: string,
    formTargetDate: string,
    formDescription: string,
    editingWishlist: WishlistItem | null
  ) => {
    e.preventDefault();

    if (!formName.trim()) {
      showErrorToast("Nama barang tidak boleh kosong");
      return;
    }

    const qtyNum = parseInt(formQty);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      showErrorToast("Kuantitas (qty) harus lebih besar dari 0");
      return;
    }

    const priceNum = parseFloat(formPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      showErrorToast("Harga barang tidak boleh kurang dari 0");
      return;
    }

    if (!user) {
      showErrorToast("Sesi pengguna tidak valid");
      return;
    }

    try {
      setSubmittingWishlist(true);
      const targetDateISO = formTargetDate ? new Date(formTargetDate).toISOString() : null;

      const payload = {
        name: formName.trim(),
        qty: qtyNum,
        price: priceNum,
        target_date: targetDateISO,
        description: formDescription.trim() || null
      };

      if (editingWishlist) {
        await updateWishlist(editingWishlist.id, payload);
      } else {
        await createWishlist({
          user_id: user.id,
          ...payload
        });
      }

      closeAllModals();
      resetForm();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      showErrorToast("Gagal menyimpan barang: " + message);
    } finally {
      setSubmittingWishlist(false);
    }
  };

  const handleDeleteWishlist = async (wishlistToDelete: WishlistItem | null) => {
    if (!wishlistToDelete) return;
    try {
      setIsDeleteSubmitting(true);
      await deleteWishlist(wishlistToDelete.id);
      closeAllModals();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      showErrorToast("Gagal menghapus barang: " + message);
    } finally {
      setIsDeleteSubmitting(false);
    }
  };

  const handleConfirmPurchase = async (
    wishlistToToggle: WishlistItem | null,
    purchaseWalletId: string
  ) => {
    if (!wishlistToToggle) return;
    if (!purchaseWalletId) {
      showErrorToast("Pilih dompet pembayaran terlebih dahulu.");
      return;
    }
    try {
      setSubmittingToggle(true);
      await purchaseItem(wishlistToToggle.id, purchaseWalletId);
      closeAllModals();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      showErrorToast("Gagal memproses pembelian: " + message);
    } finally {
      setSubmittingToggle(false);
    }
  };

  const handleConfirmUnpurchase = async (
    wishlistToToggle: WishlistItem | null
  ) => {
    if (!wishlistToToggle) return;
    try {
      setSubmittingToggle(true);
      await unpurchaseItem(wishlistToToggle.id);
      closeAllModals();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      showErrorToast("Gagal membatalkan status pembelian: " + message);
    } finally {
      setSubmittingToggle(false);
    }
  };

  return {
    handleSaveWishlist,
    handleDeleteWishlist,
    handleConfirmPurchase,
    handleConfirmUnpurchase
  };
}

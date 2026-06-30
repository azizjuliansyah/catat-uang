import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useApp } from "@/app/providers/AppProvider";
import { useToast } from "@/components/ui/molecules/Toast";
import { WishlistItem } from "../types";
import {
  fetchWishlist as fetchWishlistSvc,
  createWishlist as createWishlistSvc,
  updateWishlist as updateWishlistSvc,
  deleteWishlist as deleteWishlistSvc,
  markAsPurchased,
  markAsUnpurchased
} from "../services";

export function useWishlistData() {
  const supabase = createClient();
  const { user, wallets, categories, refreshWallets } = useApp();
  const { error: showErrorToast, success: showSuccessToast } = useToast();

  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load wishlist when user changes
  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  async function fetchWishlist() {
    try {
      setLoading(true);
      const data = await fetchWishlistSvc(supabase);
      setWishlist(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error(err);
      showErrorToast("Gagal memuat daftar keinginan: " + message);
    } finally {
      setLoading(false);
    }
  }

  async function createWishlist(data: {
    user_id: string;
    name: string;
    qty: number;
    price: number;
    target_date: string | null;
    description: string | null;
  }) {
    await createWishlistSvc(supabase, data);
    showSuccessToast("Barang berhasil ditambahkan ke daftar!");
    await fetchWishlist();
  }

  async function updateWishlist(id: string, data: {
    name: string;
    qty: number;
    price: number;
    target_date: string | null;
    description: string | null;
  }) {
    await updateWishlistSvc(supabase, id, data);
    showSuccessToast("Barang berhasil diperbarui!");
    await fetchWishlist();
  }

  async function deleteWishlist(id: string) {
    await deleteWishlistSvc(supabase, id);
    showSuccessToast("Barang berhasil dihapus dari daftar");
    await fetchWishlist();
    await refreshWallets();
  }

  // Find default category ID for wishlist purchase (Belanja or Lainnya)
  const defaultCategoryId = (() => {
    const belanjaCategory = categories.find(
      c => c.name.toLowerCase() === "belanja" && c.type === "expense"
    );
    const lainnyaCategory = categories.find(
      c => c.name.toLowerCase() === "lainnya" && c.type === "expense"
    );
    const firstExpenseCategory = categories.find(c => c.type === "expense");
    return belanjaCategory?.id || lainnyaCategory?.id || firstExpenseCategory?.id || null;
  })();

  async function purchaseItem(id: string, walletId: string) {
    try {
      const item = wishlist.find(i => i.id === id);
      if (!item || !user) return;
      const amount = item.price * item.qty;
      const description = `Pembelian Wishlist: ${item.name} (${item.qty}x)`;

      const newTxId = await markAsPurchased(supabase, id, {
        user_id: user.id,
        wallet_id: walletId,
        amount,
        description,
        category_id: defaultCategoryId
      });

      // Update local state optimistically
      setWishlist(prev =>
        prev.map(item =>
          item.id === id ? { ...item, is_purchased: true, transaction_id: newTxId } : item
        )
      );
      showSuccessToast(`Barang "${item.name}" berhasil ditandai sebagai terbeli!`);
      await refreshWallets();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      showErrorToast("Gagal menandai barang sebagai terbeli: " + message);
    }
  }

  async function unpurchaseItem(id: string) {
    try {
      const item = wishlist.find(i => i.id === id);
      if (!item) return;
      if (!item.transaction_id) {
        showErrorToast("Tidak ada transaksi pembelian yang terhubung.");
        return;
      }

      await markAsUnpurchased(supabase, id, item.transaction_id);

      // Update local state optimistically
      setWishlist(prev =>
        prev.map(item =>
          item.id === id ? { ...item, is_purchased: false, transaction_id: null } : item
        )
      );
      showSuccessToast(`Barang "${item.name}" ditandai belum terbeli.`);
      await refreshWallets();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      showErrorToast("Gagal membatalkan pembelian: " + message);
    }
  }

  // Get active wallets for selection
  const activeWallets = wallets.filter(w => !w.is_archived);

  return {
    wishlist,
    loading,
    user,
    activeWallets,
    fetchWishlist,
    createWishlist,
    updateWishlist,
    deleteWishlist,
    purchaseItem,
    unpurchaseItem
  };
}

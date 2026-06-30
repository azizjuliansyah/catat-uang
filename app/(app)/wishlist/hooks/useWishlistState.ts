import { useState, useEffect } from "react";
import { WishlistItem } from "../types";
import { formatForDateTimeInput } from "@/lib/utils/date";

export function useWishlistState(activeWallets: Array<{ id: string; is_default?: boolean }>) {
  // Filter and Search States
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "purchased">("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal Control States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPurchaseConfirmModalOpen, setIsPurchaseConfirmModalOpen] = useState(false);
  const [isUnpurchaseConfirmModalOpen, setIsUnpurchaseConfirmModalOpen] = useState(false);

  // Form State - Add / Edit Wish List Item
  const [formName, setFormName] = useState("");
  const [formQty, setFormQty] = useState("1");
  const [formPrice, setFormPrice] = useState("");
  const [formTargetDate, setFormTargetDate] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [editingWishlist, setEditingWishlist] = useState<WishlistItem | null>(null);
  const [submittingWishlist, setSubmittingWishlist] = useState(false);

  // Purchase/Unpurchase States
  const [wishlistToToggle, setWishlistToToggle] = useState<WishlistItem | null>(null);
  const [purchaseWalletId, setPurchaseWalletId] = useState("");
  const [submittingToggle, setSubmittingToggle] = useState(false);

  // Delete States
  const [wishlistToDelete, setWishlistToDelete] = useState<WishlistItem | null>(null);
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);

  // Set default wallet ID when activeWallets change
  useEffect(() => {
    if (activeWallets.length > 0 && !purchaseWalletId) {
      const defaultWallet = activeWallets.find(w => w.is_default) || activeWallets[0];
      setPurchaseWalletId(defaultWallet.id);
    }
  }, [activeWallets, purchaseWalletId]);

  const resetForm = () => {
    setFormName("");
    setFormQty("1");
    setFormPrice("");
    setFormTargetDate("");
    setFormDescription("");
    setEditingWishlist(null);
  };

  const openAddModal = () => {
    resetForm();
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 3);
    setFormTargetDate(formatForDateTimeInput(futureDate.toISOString()));
    setIsAddModalOpen(true);
  };

  const openEditModal = (item: WishlistItem) => {
    setEditingWishlist(item);
    setFormName(item.name);
    setFormQty(item.qty.toString());
    setFormPrice(item.price.toString());
    setFormTargetDate(item.target_date ? formatForDateTimeInput(item.target_date) : "");
    setFormDescription(item.description || "");
    setIsEditModalOpen(true);
  };

  const openPurchaseModal = (item: WishlistItem) => {
    setWishlistToToggle(item);
    // Reset to default wallet when opening purchase modal
    if (activeWallets.length > 0) {
      const defaultWallet = activeWallets.find(w => w.is_default) || activeWallets[0];
      setPurchaseWalletId(defaultWallet.id);
    }
    setIsPurchaseConfirmModalOpen(true);
  };

  const openUnpurchaseModal = (item: WishlistItem) => {
    setWishlistToToggle(item);
    setIsUnpurchaseConfirmModalOpen(true);
  };

  const closeAllModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsPurchaseConfirmModalOpen(false);
    setIsUnpurchaseConfirmModalOpen(false);
    setWishlistToDelete(null);
    setWishlistToToggle(null);
  };

  return {
    // Filters
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,

    // Modals
    isAddModalOpen,
    setIsAddModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isPurchaseConfirmModalOpen,
    setIsPurchaseConfirmModalOpen,
    isUnpurchaseConfirmModalOpen,
    setIsUnpurchaseConfirmModalOpen,

    // Form
    formName,
    setFormName,
    formQty,
    setFormQty,
    formPrice,
    setFormPrice,
    formTargetDate,
    setFormTargetDate,
    formDescription,
    setFormDescription,
    editingWishlist,
    setEditingWishlist,
    submittingWishlist,
    setSubmittingWishlist,

    // Purchase/Unpurchase
    wishlistToToggle,
    setWishlistToToggle,
    purchaseWalletId,
    setPurchaseWalletId,
    submittingToggle,
    setSubmittingToggle,

    // Delete
    wishlistToDelete,
    setWishlistToDelete,
    isDeleteSubmitting,
    setIsDeleteSubmitting,

    // Actions
    resetForm,
    openAddModal,
    openEditModal,
    openPurchaseModal,
    openUnpurchaseModal,
    closeAllModals
  };
}

"use client";

import { Heart } from "lucide-react";
import { useWishlistData, useWishlistState, useWishlistHandlers } from "./hooks";
import {
  WishlistHeader,
  WishlistFilterBar,
  WishlistSummary,
  WishlistCard,
  WishlistModals,
  WishlistGridSkeleton
} from "./components";
import { EmptyState } from "@/components/ui/organisms/EmptyState";
import { WishlistPageSkeleton } from "./page.skeleton";

export default function WishlistPage() {
  const {
    wishlist,
    loading,
    user,
    activeWallets,
    createWishlist,
    updateWishlist,
    deleteWishlist,
    purchaseItem,
    unpurchaseItem
  } = useWishlistData();

  const state = useWishlistState(activeWallets);

  const {
    handleSaveWishlist,
    handleDeleteWishlist,
    handleConfirmPurchase,
    handleConfirmUnpurchase
  } = useWishlistHandlers({
    user,
    createWishlist,
    updateWishlist,
    deleteWishlist,
    purchaseItem,
    unpurchaseItem,
    closeAllModals: state.closeAllModals,
    resetForm: state.resetForm,
    setSubmittingWishlist: state.setSubmittingWishlist,
    setIsDeleteSubmitting: state.setIsDeleteSubmitting,
    setSubmittingToggle: state.setSubmittingToggle
  });

  // Filter and Search logic
  const filteredWishlist = wishlist.filter((item) => {
    const matchesFilter =
      state.statusFilter === "all" ||
      (state.statusFilter === "pending" && !item.is_purchased) ||
      (state.statusFilter === "purchased" && item.is_purchased);

    const matchesSearch = item.name
      .toLowerCase()
      .includes(state.searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleSubmitWishlist = (e: React.FormEvent) => {
    handleSaveWishlist(
      e,
      state.formName,
      state.formQty,
      state.formPrice,
      state.formTargetDate,
      state.formDescription,
      state.editingWishlist
    );
  };

  if (loading && wishlist.length === 0) {
    return <WishlistPageSkeleton />;
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <WishlistHeader onAddClick={state.openAddModal} />

      {/* Filters and Search */}
      <WishlistFilterBar
        statusFilter={state.statusFilter}
        searchTerm={state.searchTerm}
        onStatusFilterChange={state.setStatusFilter}
        onSearchChange={state.setSearchTerm}
      />

      {/* Summary Cards */}
      <WishlistSummary wishlist={wishlist} isLoading={loading} />

      {/* Wishlist Cards Grid */}
      {loading ? (
        <WishlistGridSkeleton />
      ) : filteredWishlist.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Tidak ada barang di wishlist"
          description={
            state.searchTerm
              ? "Coba ganti kata kunci pencarian Anda."
              : state.statusFilter !== "all"
              ? `Tidak ada barang dengan status "${
                  state.statusFilter === "pending" ? "Belum Terbeli" : "Sudah Terbeli"
                }"`
              : "Mulai catat barang impian Anda dan kelola prioritas belanja Anda."
          }
          actionLabel={!state.searchTerm && state.statusFilter === "all" ? "Tambah Barang Pertama" : undefined}
          onAction={!state.searchTerm && state.statusFilter === "all" ? state.openAddModal : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredWishlist.map((item) => (
            <WishlistCard
              key={item.id}
              item={item}
              onEdit={state.openEditModal}
              onDelete={state.setWishlistToDelete}
              onTogglePurchased={(targetItem) => {
                if (targetItem.is_purchased) {
                  state.openUnpurchaseModal(targetItem);
                } else {
                  state.openPurchaseModal(targetItem);
                }
              }}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <WishlistModals
        isAddModalOpen={state.isAddModalOpen}
        isEditModalOpen={state.isEditModalOpen}
        formName={state.formName}
        setFormName={state.setFormName}
        formQty={state.formQty}
        setFormQty={state.setFormQty}
        formPrice={state.formPrice}
        setFormPrice={state.setFormPrice}
        formTargetDate={state.formTargetDate}
        setFormTargetDate={state.setFormTargetDate}
        formDescription={state.formDescription}
        setFormDescription={state.setFormDescription}
        editingWishlist={state.editingWishlist}
        submittingWishlist={state.submittingWishlist}
        onSubmitWishlist={handleSubmitWishlist}
        closeAllModals={state.closeAllModals}

        isPurchaseConfirmModalOpen={state.isPurchaseConfirmModalOpen}
        isUnpurchaseConfirmModalOpen={state.isUnpurchaseConfirmModalOpen}
        wishlistToToggle={state.wishlistToToggle}
        purchaseWalletId={state.purchaseWalletId}
        setPurchaseWalletId={state.setPurchaseWalletId}
        submittingToggle={state.submittingToggle}
        onPurchaseConfirm={() => handleConfirmPurchase(state.wishlistToToggle, state.purchaseWalletId)}
        onUnpurchaseConfirm={() => handleConfirmUnpurchase(state.wishlistToToggle)}
        wallets={activeWallets}

        wishlistToDelete={state.wishlistToDelete}
        setWishlistToDelete={state.setWishlistToDelete}
        isDeleteSubmitting={state.isDeleteSubmitting}
        onDeleteConfirm={() => handleDeleteWishlist(state.wishlistToDelete)}
      />
    </div>
  );
}

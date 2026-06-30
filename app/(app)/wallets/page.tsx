"use client";

import { useMemo } from "react";
import { DndContext, closestCenter, MouseSensor, TouchSensor, KeyboardSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { useApp } from "@/app/providers/AppProvider";
import { Button } from "@/components/ui/atoms/Button";

import { useWalletsState, useWalletsHandlers } from "./hooks";
import {
  WalletHeader,
  WalletSummary,
  WalletFilterBar,
  WalletCard,
  WalletGridSkeleton,
  AddWalletModal,
  EditWalletModal,
  TransferModal,
  DeleteWalletModal
} from "./components";
import { EmptyState } from "@/components/ui/organisms/EmptyState";
import { Wallet as DefaultWalletIcon, Search } from "lucide-react";


export default function WalletsPage() {
  const { user, wallets, loadingWallets: loading, refreshWallets } = useApp();

  const state = useWalletsState(wallets, user);

  const handlers = useWalletsHandlers({
    user,
    wallets,
    refreshWallets,
    setIsAddModalOpen: state.setIsAddModalOpen,
    setIsEditModalOpen: state.setIsEditModalOpen,
    setIsTransferModalOpen: state.setIsTransferModalOpen,
    setWalletToDelete: state.setWalletToDelete,
    resetAddForm: state.resetAddForm,
    addName: state.addName,
    addInitialBalance: state.addInitialBalance,
    addIcon: state.addIcon,
    addColor: state.addColor,
    addIsDefault: state.addIsDefault,
    setAddSubmitting: state.setAddSubmitting,
    editingWallet: state.editingWallet,
    editName: state.editName,
    editIcon: state.editIcon,
    editColor: state.editColor,
    editIsDefault: state.editIsDefault,
    setEditSubmitting: state.setEditSubmitting,
    tfSourceId: state.tfSourceId,
    tfDestId: state.tfDestId,
    tfAmount: state.tfAmount,
    setTfAmount: state.setTfAmount,
    tfDescription: state.tfDescription,
    setTfDescription: state.setTfDescription,
    tfDate: state.tfDate,
    setTfSubmitting: state.setTfSubmitting,
    setIsDeleteSubmitting: state.setIsDeleteSubmitting,
    setOrderedWallets: state.setOrderedWallets
  });

  // DND Sensors setup
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle Drag End
  function handleDragEnd(event: DragEndEvent) {
    handlers.handleDragEnd(event, arrayMove);
  }

  return (
    <div className="space-y-6 font-sans">
      {/* [1] Page Header */}
      <WalletHeader
        wallets={wallets}
        onTransferClick={state.openTransferModal}
        onAddClick={() => state.setIsAddModalOpen(true)}
      />

      {/* [1.5] Summary Card */}
      <WalletSummary
        activeWalletsTotal={state.activeWalletsTotal}
        wallets={wallets}
        isLoading={loading}
      />

      {/* [2] Filter Bar (Tabs + Search) */}
      <WalletFilterBar
        activeTab={state.activeTab}
        onTabChange={state.setActiveTab}
        searchTerm={state.searchTerm}
        onSearchChange={state.setSearchTerm}
        wallets={wallets}
      />

      {/* [3] Content Grid */}
      {loading ? (
        <WalletGridSkeleton />
      ) : state.filteredWallets.length === 0 ? (
        <EmptyState
          icon={state.searchTerm.trim().length > 0 ? Search : DefaultWalletIcon}
          title={state.searchTerm.trim().length > 0 ? "Tidak ada hasil pencarian" : "Tidak ada dompet ditemukan"}
          description={
            state.searchTerm.trim().length > 0
              ? `Kami tidak menemukan dompet dengan nama "${state.searchTerm}". Silakan bersihkan pencarian atau coba kata kunci lain.`
              : state.activeTab === "active"
                ? "Tambahkan dompet pertama Anda untuk mulai mencatat dan mengelola keuangan Anda."
                : "Belum ada dompet yang Anda arsipkan."
          }
          actionLabel={
            state.searchTerm.trim().length > 0
              ? "Bersihkan Pencarian"
              : state.activeTab === "active"
                ? "Tambah Dompet Baru"
                : undefined
          }
          onAction={
            state.searchTerm.trim().length > 0
              ? () => state.setSearchTerm("")
              : () => state.setIsAddModalOpen(true)
          }
        />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={state.filteredWallets.map(w => w.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {state.filteredWallets.map((wallet) => (
                <WalletCard
                  key={wallet.id}
                  wallet={wallet}
                  onEdit={state.openEditModal}
                  onArchive={handlers.toggleArchiveWallet}
                  onDelete={state.setWalletToDelete}
                  onSetDefault={handlers.setDefaultWallet}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Modals */}
      <AddWalletModal
        isOpen={state.isAddModalOpen}
        onClose={() => state.setIsAddModalOpen(false)}
        onSubmit={handlers.handleAddWallet}
        addName={state.addName}
        setAddName={state.setAddName}
        addInitialBalance={state.addInitialBalance}
        setAddInitialBalance={state.setAddInitialBalance}
        addIcon={state.addIcon}
        setAddIcon={state.setAddIcon}
        addColor={state.addColor}
        setAddColor={state.setAddColor}
        addIsDefault={state.addIsDefault}
        setAddIsDefault={state.setAddIsDefault}
        isSubmitting={state.addSubmitting}
      />

      <EditWalletModal
        isOpen={state.isEditModalOpen}
        onClose={() => state.setIsEditModalOpen(false)}
        onSubmit={handlers.handleEditWallet}
        editingWallet={state.editingWallet}
        editName={state.editName}
        setEditName={state.setEditName}
        editIcon={state.editIcon}
        setEditIcon={state.setEditIcon}
        editColor={state.editColor}
        setEditColor={state.setEditColor}
        editIsDefault={state.editIsDefault}
        setEditIsDefault={state.setEditIsDefault}
        isSubmitting={state.editSubmitting}
      />

      <TransferModal
        isOpen={state.isTransferModalOpen}
        onClose={() => state.setIsTransferModalOpen(false)}
        onSubmit={handlers.handleTransfer}
        wallets={wallets}
        tfSourceId={state.tfSourceId}
        setTfSourceId={state.setTfSourceId}
        tfDestId={state.tfDestId}
        setTfDestId={state.setTfDestId}
        tfAmount={state.tfAmount}
        setTfAmount={state.setTfAmount}
        tfDate={state.tfDate}
        setTfDate={state.setTfDate}
        tfDescription={state.tfDescription}
        setTfDescription={state.setTfDescription}
        isSubmitting={state.tfSubmitting}
      />

      <DeleteWalletModal
        isOpen={state.walletToDelete !== null}
        onClose={() => state.setWalletToDelete(null)}
        walletToDelete={state.walletToDelete}
        onConfirm={() => handlers.handleDeleteWallet(state.walletToDelete)}
        isSubmitting={state.isDeleteSubmitting}
      />
    </div>
  );
}

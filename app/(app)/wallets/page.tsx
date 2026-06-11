"use client";

import { useMemo } from "react";
import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { Wallet as DefaultWalletIcon } from "lucide-react";
import { useApp } from "@/app/providers/AppProvider";
import { SkeletonCard } from "@/components/ui/organisms/SkeletonLoading";
import { Button } from "@/components/ui/atoms/Button";

import { useWalletsState } from "./hooks/useWalletsState";
import { useWalletsHandlers } from "./hooks/useWalletsHandlers";

import { WalletsHeader } from "./components/WalletsHeader";
import { WalletsTabs } from "./components/WalletsTabs";
import { WalletCard } from "./components/WalletCard";
import { AddWalletModal } from "./components/modals/AddWalletModal";
import { EditWalletModal } from "./components/modals/EditWalletModal";
import { TransferModal } from "./components/modals/TransferModal";
import { DeleteWalletModal } from "./components/modals/DeleteWalletModal";

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
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
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
      {/* Header section */}
      <WalletsHeader
        activeWalletsTotal={state.activeWalletsTotal}
        wallets={wallets}
        onTransferClick={state.openTransferModal}
        onAddClick={() => state.setIsAddModalOpen(true)}
      />

      {/* Tabs Switcher */}
      <WalletsTabs
        activeTab={state.activeTab}
        onTabChange={state.setActiveTab}
        wallets={wallets}
      />

      {/* Grid List of Wallets */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="p-[1.5px] rounded-2xl bg-border/30 w-full h-44 animate-pulse">
              <div className="bg-surface-card rounded-[15px] w-full h-full p-5 flex flex-col justify-between relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-surface-hover shrink-0" />
                    <div className="space-y-1.5">
                      <div className="h-4 w-24 bg-surface-hover rounded" />
                      <div className="h-3 w-12 bg-surface-hover rounded" />
                    </div>
                  </div>
                </div>
                <div className="pt-2.5 border-t border-border/40 space-y-1.5">
                  <div className="h-3 w-16 bg-surface-hover rounded" />
                  <div className="h-5 w-32 bg-surface-hover rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : state.filteredWallets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 border border-dashed border-border rounded-2xl text-center">
          <div className="w-12 h-12 rounded-full bg-surface-hover flex items-center justify-center text-text-secondary/40 mb-3">
            <DefaultWalletIcon className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-text-primary">Tidak ada dompet ditemukan</h3>
          <p className="text-xs text-text-secondary mt-1 max-w-sm">
            {state.activeTab === "active"
              ? "Tambahkan dompet pertama Anda untuk mulai mencatat dan mengelola keuangan Anda."
              : "Belum ada dompet yang Anda arsipkan."}
          </p>
          {state.activeTab === "active" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => state.setIsAddModalOpen(true)}
              className="mt-4 text-xs text-primary font-bold hover:underline cursor-pointer min-h-0 py-1 px-2"
            >
              Tambah dompet baru →
            </Button>
          )}
        </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

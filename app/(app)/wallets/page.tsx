"use client";

import { useMemo } from "react";
import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { Wallet as DefaultWalletIcon } from "lucide-react";
import { useApp } from "@/app/providers/AppProvider";
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
import { WalletsSkeleton } from "./components/WalletsSkeleton";

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
    <div className="space-y-8 font-sans">
      {/* [1] Page Header + Summary Card */}
      <WalletsHeader
        activeWalletsTotal={state.activeWalletsTotal}
        wallets={wallets}
        onTransferClick={state.openTransferModal}
        onAddClick={() => state.setIsAddModalOpen(true)}
      />

      {/* [2] Filter Bar (Tabs) */}
      <WalletsTabs
        activeTab={state.activeTab}
        onTabChange={state.setActiveTab}
        wallets={wallets}
      />

      {/* [3] Content Grid */}
      {loading ? (
        <WalletsSkeleton />
      ) : state.filteredWallets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 border border-dashed border-border rounded-lg bg-surface-card/50 text-center max-w-md mx-auto">
          <div className="w-14 h-14 rounded-lg bg-surface-hover flex items-center justify-center text-text-muted mb-4">
            <DefaultWalletIcon className="w-7 h-7" />
          </div>
          <h3 className="text-section-title text-text-primary font-display mb-2">
            Tidak ada dompet ditemukan
          </h3>
          <p className="text-body text-text-secondary max-w-sm mb-6">
            {state.activeTab === "active"
              ? "Tambahkan dompet pertama Anda untuk mulai mencatat dan mengelola keuangan Anda."
              : "Belum ada dompet yang Anda arsipkan."}
          </p>
          {state.activeTab === "active" && (
            <Button
              variant="secondary"
              size="md"
              onClick={() => state.setIsAddModalOpen(true)}
            >
              Tambah Dompet Baru
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

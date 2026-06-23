"use client";

import { useMemo } from "react";
import { DndContext, closestCenter, MouseSensor, TouchSensor, KeyboardSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { useApp } from "@/app/providers/AppProvider";
import { Button } from "@/components/ui/atoms/Button";

import { useWalletsState } from "./hooks/useWalletsState";
import { useWalletsHandlers } from "./hooks/useWalletsHandlers";

import { WalletsHeader } from "./components/WalletsHeader";
import { WalletsFilterBar } from "./components/WalletsFilterBar";
import { WalletCard } from "./components/WalletCard";
import { WalletsEmptyState } from "./components/WalletsEmptyState";
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
      {/* [1] Page Header + Summary Card */}
      <WalletsHeader
        activeWalletsTotal={state.activeWalletsTotal}
        wallets={wallets}
        onTransferClick={state.openTransferModal}
        onAddClick={() => state.setIsAddModalOpen(true)}
      />

      {/* [2] Filter Bar (Tabs + Search) */}
      <WalletsFilterBar
        activeTab={state.activeTab}
        onTabChange={state.setActiveTab}
        searchTerm={state.searchTerm}
        onSearchChange={state.setSearchTerm}
        wallets={wallets}
      />

      {/* [3] Content Grid */}
      {loading ? (
        <WalletsSkeleton />
      ) : state.filteredWallets.length === 0 ? (
        <WalletsEmptyState
          activeTab={state.activeTab}
          onAddClick={() => state.setIsAddModalOpen(true)}
          searchTerm={state.searchTerm}
          onClearSearch={() => state.setSearchTerm("")}
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

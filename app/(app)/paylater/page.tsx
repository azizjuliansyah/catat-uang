"use client";

import { usePaylaterState, usePaylaterHandlers } from "./hooks";
import {
  PaylaterHeader,
  PaylaterSummary,
  PaylaterGrid,
  PaylaterModal,
  DeletePaylaterModal
} from "./components";
import { EmptyState } from "@/components/ui/organisms/EmptyState";
import { FolderMinus } from "lucide-react";
import { PaylaterPageSkeleton, PaylaterGridSkeleton } from "./page.skeleton";

export default function PaylaterPage() {
  const state = usePaylaterState();
  const handlers = usePaylaterHandlers(state);

  const {
    loading,
    isPaylaterModalOpen,
    setIsPaylaterModalOpen,
    editingPlatform,
    setEditingPlatform,
    platformToDelete,
    setPlatformToDelete,
    activePlatforms,
    totalLimit,
    totalUsed,
    totalAvailable,
    overallUsagePercentage
  } = state;

  const {
    handleRefreshAll,
    handleAddFirst,
    handleEditPlatform,
    handleDeletePlatform
  } = handlers;

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <PaylaterHeader onAddClick={handleAddFirst} />

      {/* Summary Cards */}
      <PaylaterSummary
        loading={loading}
        totalUsed={totalUsed}
        totalAvailable={totalAvailable}
        totalLimit={totalLimit}
        overallUsagePercentage={overallUsagePercentage}
        hasPlatforms={activePlatforms.length > 0}
        platformCount={activePlatforms.length}
      />

      {/* Grid List */}
      {loading ? (
        <PaylaterGridSkeleton />
      ) : activePlatforms.length === 0 ? (
        <EmptyState
          icon={FolderMinus}
          title="Belum ada platform Paylater"
          description="Tambahkan platform Paylater (seperti GoPay Later, Shopee PayLater) untuk mulai mencatat dan memantau limit kredit Anda secara teratur."
          actionLabel="Tambah Platform Pertama"
          onAction={handleAddFirst}
        />
      ) : (
        <PaylaterGrid
          loading={loading}
          platforms={activePlatforms}
          onAddFirst={handleAddFirst}
          onEdit={handleEditPlatform}
          onDelete={handleDeletePlatform}
        />
      )}

      {/* Paylater Platform Modal (Add / Edit) */}
      <PaylaterModal
        isOpen={isPaylaterModalOpen}
        onClose={() => {
          setIsPaylaterModalOpen(false);
          setEditingPlatform(null);
        }}
        editingPlatform={editingPlatform}
        onSaveSuccess={handleRefreshAll}
      />

      {/* Paylater Platform Delete Modal */}
      <DeletePaylaterModal
        isOpen={platformToDelete !== null}
        onClose={() => setPlatformToDelete(null)}
        platformToDelete={platformToDelete}
        onDeleteSuccess={handleRefreshAll}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { useApp } from "@/app/providers/AppProvider";
import { Button } from "@/components/ui/atoms/Button";
import { PageHeader } from "@/components/ui/molecules/PageHeader";
import { CreditCard, Plus } from "lucide-react";
import { PaylaterModal } from "./components/PaylaterModal";
import { DeletePaylaterModal } from "./components/DeletePaylaterModal";
import { PaylaterSummaryCards } from "./components/PaylaterSummaryCards";
import { PaylaterGrid } from "./components/PaylaterGrid";
import { PaylaterPlatform } from "./types";

export default function PaylaterPage() {
  const {
    paylaterPlatforms,
    loadingPaylaterPlatforms,
    refreshPaylaterPlatforms,
    refreshWallets
  } = useApp();

  // Modals state
  const [isPaylaterModalOpen, setIsPaylaterModalOpen] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<PaylaterPlatform | null>(null);
  const [platformToDelete, setPlatformToDelete] = useState<PaylaterPlatform | null>(null);

  const activePlatforms = paylaterPlatforms.filter((p) => !p.is_archived);

  // Summary calculations
  const totalLimit = activePlatforms.reduce((acc, p) => acc + p.limit_amount, 0);
  const totalUsed = activePlatforms.reduce((acc, p) => acc + p.balance, 0);
  const totalAvailable = totalLimit - totalUsed;
  const overallUsagePercentage = totalLimit > 0 ? Math.min((totalUsed / totalLimit) * 100, 100) : 0;

  const handleRefreshAll = () => {
    refreshPaylaterPlatforms();
    refreshWallets();
  };

  const handleAddFirst = () => {
    setEditingPlatform(null);
    setIsPaylaterModalOpen(true);
  };

  const handleEditPlatform = (platform: PaylaterPlatform) => {
    setEditingPlatform(platform);
    setIsPaylaterModalOpen(true);
  };

  const handleDeletePlatform = (platform: PaylaterPlatform) => {
    setPlatformToDelete(platform);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <PageHeader
        icon={CreditCard}
        title="Kelola Paylater"
        description="Kelola batas kredit, siklus tagihan, jatuh tempo, dan bayar tagihan platform Paylater Anda."
        actions={
          <Button
            onClick={handleAddFirst}
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Platform Baru
          </Button>
        }
      />

      {/* Summary Cards */}
      <PaylaterSummaryCards
        loading={loadingPaylaterPlatforms}
        totalUsed={totalUsed}
        totalAvailable={totalAvailable}
        totalLimit={totalLimit}
        overallUsagePercentage={overallUsagePercentage}
        hasPlatforms={activePlatforms.length > 0}
        platformCount={activePlatforms.length}
      />

      {/* Grid List */}
      <PaylaterGrid
        loading={loadingPaylaterPlatforms}
        platforms={activePlatforms}
        onAddFirst={handleAddFirst}
        onEdit={handleEditPlatform}
        onDelete={handleDeletePlatform}
      />

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

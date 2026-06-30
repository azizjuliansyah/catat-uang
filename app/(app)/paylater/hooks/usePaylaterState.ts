import { useState } from "react";
import { useApp } from "@/app/providers/AppProvider";
import { PaylaterPlatform } from "../types";

export function usePaylaterState() {
  const {
    paylaterPlatforms,
    loadingPaylaterPlatforms: loading,
    refreshPaylaterPlatforms,
    refreshWallets
  } = useApp();

  const [isPaylaterModalOpen, setIsPaylaterModalOpen] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<PaylaterPlatform | null>(null);
  const [platformToDelete, setPlatformToDelete] = useState<PaylaterPlatform | null>(null);

  const activePlatforms = paylaterPlatforms.filter((p) => !p.is_archived);

  // Summary calculations
  const totalLimit = activePlatforms.reduce((acc, p) => acc + p.limit_amount, 0);
  const totalUsed = activePlatforms.reduce((acc, p) => acc + p.balance, 0);
  const totalAvailable = totalLimit - totalUsed;
  const overallUsagePercentage = totalLimit > 0 ? Math.min((totalUsed / totalLimit) * 100, 100) : 0;

  return {
    paylaterPlatforms,
    loading,
    refreshPaylaterPlatforms,
    refreshWallets,
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
  };
}

export type PaylaterState = ReturnType<typeof usePaylaterState>;

import { PaylaterState } from "./usePaylaterState";
import { PaylaterPlatform } from "../types";

export function usePaylaterHandlers(state: PaylaterState) {
  const {
    refreshPaylaterPlatforms,
    refreshWallets,
    setIsPaylaterModalOpen,
    setEditingPlatform,
    setPlatformToDelete
  } = state;

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

  return {
    handleRefreshAll,
    handleAddFirst,
    handleEditPlatform,
    handleDeletePlatform
  };
}

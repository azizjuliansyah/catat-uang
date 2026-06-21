import { WalletDetailState } from "./useWalletDetailState";
import { Transaction } from "../types";

export function useWalletDetailHandlers(state: WalletDetailState) {
  const { setSelectedTransaction, setIsDetailModalOpen, router } = state;

  const handleTransactionClick = (tx: Transaction) => {
    setSelectedTransaction(tx);
    setIsDetailModalOpen(true);
  };

  const handleModalClose = () => {
    setIsDetailModalOpen(false);
    setSelectedTransaction(null);
  };

  const handleEditTransaction = (tx: Transaction) => {
    router.push(`/transactions/${tx.id}`);
  };

  const formatDateGroup = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return {
    handleTransactionClick,
    handleModalClose,
    handleEditTransaction,
    formatDateGroup
  };
}

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useApp } from "@/app/providers/AppProvider";
import { useToast } from "@/components/ui/molecules/Toast";
import { Transaction } from "../types";
import { fetchTransactions as fetchTransactionsSvc, deleteTransaction as deleteTransactionSvc } from "../services";

export function useTransactionsHandlers(
  dateRangeType: string,
  customStartDate: string,
  customEndDate: string
) {
  const supabase = createClient();
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  const { user, refreshWallets } = useApp();

  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function fetchTransactions() {
    if (!user) return;
    setLoading(true);
    try {
      const data = await fetchTransactionsSvc(supabase, user.id, dateRangeType, customStartDate, customEndDate);
      setTransactions(data);
    } catch (err: unknown) {
      console.error("Error fetching transactions:", err);
      const message = err instanceof Error ? err.message : String(err);
      showErrorToast("Gagal mengambil data transaksi: " + message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteTransaction(transactionToDelete: Transaction, onSuccess: () => void) {
    setDeletingId(transactionToDelete.id);
    try {
      await deleteTransactionSvc(supabase, transactionToDelete.id);

      showSuccessToast("Transaksi berhasil dihapus.");
      setTransactions((prev) => prev.filter((t) => t.id !== transactionToDelete.id));
      onSuccess();
      await refreshWallets();
    } catch (err: unknown) {
      console.error("Error deleting transaction:", err);
      const message = err instanceof Error ? err.message : String(err);
      showErrorToast("Gagal menghapus transaksi: " + message);
    } finally {
      setDeletingId(null);
    }
  }

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, dateRangeType, customStartDate, customEndDate]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleTransactionCreated = () => {
      if (user) {
        fetchTransactions();
      }
    };

    window.addEventListener("transaction-created", handleTransactionCreated);
    return () => {
      window.removeEventListener("transaction-created", handleTransactionCreated);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, dateRangeType, customStartDate, customEndDate]);

  const handleDetail = (tx: Transaction, state: any) => {
    state.setTransactionToView(tx);
    state.setIsDetailModalOpen(true);
  };

  const handleEdit = (tx: Transaction, state: any) => {
    state.setTransactionToEdit(tx);
    state.setIsEditModalOpen(true);
  };

  const handleCloseDetail = (state: any) => {
    state.setIsDetailModalOpen(false);
    state.setTransactionToView(null);
  };

  const handleCloseEdit = (state: any) => {
    state.setIsEditModalOpen(false);
    state.setTransactionToEdit(null);
  };

  return {
    loading,
    transactions,
    deletingId,
    fetchTransactions,
    handleDeleteTransaction,
    handleDetail,
    handleEdit,
    handleCloseDetail,
    handleCloseEdit,
  };
}

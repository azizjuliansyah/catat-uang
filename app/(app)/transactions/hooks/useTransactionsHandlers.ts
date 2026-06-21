import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useApp } from "@/app/providers/AppProvider";
import { useToast } from "@/components/ui/molecules/Toast";
import { Transaction } from "../types";
import { getDateRange } from "./useTransactionsState";

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
      let query = supabase
        .from("transactions")
        .select(`
          *,
          wallets (name, icon, color),
          paylater_platforms (name, color),
          categories (name, icon, color)
        `)
        .eq("user_id", user.id);

      const { startDate, endDate } = getDateRange(dateRangeType, customStartDate, customEndDate);
      const startISO = new Date(`${startDate}T00:00:00`).toISOString();
      const endISO = new Date(`${endDate}T23:59:59.999`).toISOString();
      query = query.gte("transaction_date", startISO).lte("transaction_date", endISO);

      query = query
        .order("transaction_date", { ascending: false })
        .order("created_at", { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      setTransactions((data as unknown as Transaction[]) || []);
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
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", transactionToDelete.id);

      if (error) throw error;

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

  return {
    loading,
    transactions,
    deletingId,
    fetchTransactions,
    handleDeleteTransaction,
  };
}

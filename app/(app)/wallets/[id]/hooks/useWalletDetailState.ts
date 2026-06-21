import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useApp } from "@/app/providers/AppProvider";
import { Transaction } from "../types";

export function useWalletDetailState() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { user, loadingUser, wallets, loadingWallets } = useApp();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const wallet = wallets.find((w) => w.id === id) ?? null;

  const loadTransactions = useCallback(async () => {
    if (!user || !id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select(
          "*, wallets(name, icon, color), paylater_platforms(name, color, icon), categories(name, icon, color)"
        )
        .eq("user_id", user.id)
        .eq("wallet_id", id)
        .order("transaction_date", { ascending: false });

      if (error) throw error;
      setTransactions((data as unknown as Transaction[]) || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user, id, supabase]);

  useEffect(() => {
    if (!loadingUser) {
      if (!user) {
        router.push("/login");
      } else {
        loadTransactions();
      }
    }
  }, [user, loadingUser, loadTransactions, router]);

  // Compute Stats
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);
  const netFlow = totalIncome - totalExpense;

  // Group Transactions by Date
  const groupedTransactions: { [date: string]: Transaction[] } = {};
  transactions.forEach((tx) => {
    const date = tx.transaction_date.split("T")[0];
    if (!groupedTransactions[date]) groupedTransactions[date] = [];
    groupedTransactions[date].push(tx);
  });
  const uniqueDates = Object.keys(groupedTransactions);

  const isPageLoading = loadingUser || loadingWallets || loading;

  return {
    router,
    id,
    wallet,
    transactions,
    selectedTransaction,
    setSelectedTransaction,
    isDetailModalOpen,
    setIsDetailModalOpen,
    totalIncome,
    totalExpense,
    netFlow,
    groupedTransactions,
    uniqueDates,
    isPageLoading
  };
}

export type WalletDetailState = ReturnType<typeof useWalletDetailState>;

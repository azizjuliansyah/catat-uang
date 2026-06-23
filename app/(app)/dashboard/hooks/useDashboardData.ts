/**
 * Dashboard Data Hook
 * Handles all state and data fetching for the dashboard page
 */

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useApp } from "@/app/providers/AppProvider";
import { fetchMonthlyStats, fetchRecentTransactions } from "../services";
import { getCurrentMonthRange, getErrorMessage } from "../utils";
import { DashboardTransaction } from "../types";

export function useDashboardData() {
  const supabase = createClient();
  const { user } = useApp();

  const [recentTransactions, setRecentTransactions] = useState<DashboardTransaction[]>([]);
  const [currentMonthIncome, setCurrentMonthIncome] = useState(0);
  const [currentMonthExpense, setCurrentMonthExpense] = useState(0);
  const [loadingTx, setLoadingTx] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    async function loadDashboardTxData() {
      if (!user) return;
      setLoadingTx(true);
      setErrorMsg(null);
      try {
        const { year, month } = getCurrentMonthRange();

        const stats = await fetchMonthlyStats(supabase, user.id, year, month);
        setCurrentMonthIncome(stats.income);
        setCurrentMonthExpense(stats.expense);

        const recent = await fetchRecentTransactions(supabase, user.id, 5);
        setRecentTransactions(recent);
      } catch (err: unknown) {
        console.error("Error loading dashboard transaction data:", err);
        setErrorMsg("Gagal memuat data transaksi: " + getErrorMessage(err));
      } finally {
        setLoadingTx(false);
      }
    }

    loadDashboardTxData();
  }, [supabase, user]);

  return {
    recentTransactions,
    currentMonthIncome,
    currentMonthExpense,
    loadingTx,
    errorMsg,
  };
}

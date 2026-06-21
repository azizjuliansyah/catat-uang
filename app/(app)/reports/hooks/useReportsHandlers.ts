import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useApp } from "@/app/providers/AppProvider";
import { useToast } from "@/components/ui/molecules/Toast";
import { Transaction, DebtData } from "../types";
import { exportToPDF, exportToExcel } from "../utils/exports";

export function useReportsHandlers() {
  const supabase = createClient();
  const { user } = useApp();
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [debts, setDebts] = useState<DebtData[]>([]);

  // Export loading states
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  // Fetch transactions
  async function fetchTransactions(userId: string) {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select(`
          id,
          amount,
          type,
          transaction_date,
          description,
          category_id,
          categories (name, icon, color),
          wallets (name)
        `)
        .eq("user_id", userId)
        .order("transaction_date", { ascending: true });

      if (error) throw error;
      setTransactions((data as unknown as Transaction[]) || []);
    } catch (err: unknown) {
      console.error("Error fetching transactions:", err);
      setErrorMsg("Gagal memuat data transaksi");
    }
  }

  // Fetch debts
  async function fetchDebts() {
    try {
      const { data, error } = await supabase
        .from("debts")
        .select("id, type, total_amount, paid_amount, status");

      if (error) throw error;
      setDebts((data as unknown as DebtData[]) || []);
    } catch (err: unknown) {
      console.error("Error fetching debts:", err);
    }
  }

  // Fetch data on user change
  useEffect(() => {
    async function init() {
      if (!user) return;
      setLoading(true);
      try {
        await Promise.all([fetchTransactions(user.id), fetchDebts()]);
      } finally {
        setLoading(false);
      }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleExportPDF = (options: {
    startDate: Date;
    endDate: Date;
    totalIncome: number;
    totalExpense: number;
    netCashflow: number;
    currentWalletsTotal: number;
    currentDebtsOwe: number;
    categoryBreakdown: any[];
    filteredTransactions: Transaction[];
    formatIDR: (val: number) => string;
    formatPercentage: (val: number) => string;
  }) => {
    exportToPDF({
      ...options,
      showSuccessToast,
      showErrorToast,
      setExportingPDF,
    });
  };

  const handleExportExcel = (options: {
    startDate: Date;
    endDate: Date;
    totalIncome: number;
    totalExpense: number;
    netCashflow: number;
    currentWalletsTotal: number;
    currentDebtsOwe: number;
    categoryBreakdown: any[];
    filteredTransactions: Transaction[];
  }) => {
    exportToExcel({
      ...options,
      showSuccessToast,
      showErrorToast,
      setExportingExcel,
    });
  };

  return {
    loading,
    errorMsg,
    transactions,
    debts,
    exportingPDF,
    exportingExcel,
    handleExportPDF,
    handleExportExcel,
  };
}

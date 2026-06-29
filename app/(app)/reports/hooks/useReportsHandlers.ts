import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useApp } from "@/app/providers/AppProvider";
import { useToast } from "@/components/ui/molecules/Toast";
import { Transaction, DebtData } from "../types";
import { exportToPDF, exportToExcel } from "../utils/exports";
import { fetchReportTransactions, fetchReportDebts } from "../services";

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
      const data = await fetchReportTransactions(supabase, userId);
      setTransactions(data);
    } catch (err: unknown) {
      console.error("Error fetching transactions:", err);
      setErrorMsg("Gagal memuat data transaksi");
    }
  }

  // Fetch debts
  async function fetchDebts() {
    try {
      const data = await fetchReportDebts(supabase);
      setDebts(data);
    } catch (err: unknown) {
      console.error("Error fetching debts:", err);
    }
  }

  async function loadReportsData(userId: string) {
    setLoading(true);
    try {
      await Promise.all([fetchTransactions(userId), fetchDebts()]);
    } finally {
      setLoading(false);
    }
  }

  // Fetch data on user change
  useEffect(() => {
    if (user) {
      loadReportsData(user.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Hook into transaction-created event
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleTransactionCreated = () => {
      if (user) {
        loadReportsData(user.id);
      }
    };

    window.addEventListener("transaction-created", handleTransactionCreated);
    return () => {
      window.removeEventListener("transaction-created", handleTransactionCreated);
    };
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

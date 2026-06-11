"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useApp } from "@/app/providers/AppProvider";
import { useToast } from "@/components/ui/molecules/Toast";
import { SkeletonTable } from "@/components/ui/organisms/SkeletonLoading";
import { exportToPDF, exportToExcel } from "./utils/exports";
import { ReportsHeader } from "./components/ReportsHeader";
import { PeriodFilter } from "./components/PeriodFilter";
import { SummaryCards } from "./components/SummaryCards";
import { ReportsCharts } from "./components/ReportsCharts";
import { ReportsTables } from "./components/ReportsTables";

interface Transaction {
  id: string;
  amount: number;
  type: "income" | "expense";
  transaction_date: string;
  description: string | null;
  categories: {
    name: string;
    icon: string;
    color: string;
  }[] | null;
  wallets: {
    name: string;
  }[] | null;
}

interface DebtData {
  id: string;
  type: "owe" | "lend";
  total_amount: number;
  paid_amount: number;
  status: "unpaid" | "paid";
}

type PeriodFilterType = "this_month" | "last_3_months" | "last_6_months" | "this_year" | "custom";

function getLocalDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const CHART_COLORS = {
  income: "hsl(142, 71%, 45%)",  // Emerald Green
  expense: "hsl(346, 84%, 61%)", // Rose Red
  primary: "hsl(211, 86%, 45%)", // Premium Royal Blue
  netWorth: "hsl(262, 83%, 58%)" // Deep Violet
};

export default function ReportsPage() {
  const supabase = createClient();
  const { user, wallets: cachedWallets } = useApp();
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // View Mode: Visual charts vs accessible tabular data tables
  const [viewMode, setViewMode] = useState<"visual" | "tabular">("visual");

  // Data States
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [debts, setDebts] = useState<DebtData[]>([]);

  // Filter out archived wallets
  const wallets = useMemo(() => {
    return cachedWallets.filter(w => !w.is_archived);
  }, [cachedWallets]);

  // Filter States
  const [periodFilter, setPeriodFilter] = useState<PeriodFilterType>("last_6_months");
  const [customStartDate, setCustomStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 5);
    d.setDate(1);
    return getLocalDateString(d);
  });
  const [customEndDate, setCustomEndDate] = useState(() => {
    return getLocalDateString(new Date());
  });

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

  // Fetch data
  useEffect(() => {
    async function init() {
      if (!user) return;
      setLoading(true);
      try {
        await Promise.all([
          fetchTransactions(user.id),
          fetchDebts()
        ]);
      } finally {
        setLoading(false);
      }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Get date range based on filter
  const getDateRange = () => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (periodFilter) {
      case "this_month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      case "last_3_months":
        startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1, 0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      case "last_6_months":
        startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1, 0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      case "this_year":
        startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      case "custom":
        if (customStartDate) {
          const [sYear, sMonth, sDay] = customStartDate.split("-").map(Number);
          startDate = new Date(sYear, sMonth - 1, sDay, 0, 0, 0, 0);
        } else {
          startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1, 0, 0, 0, 0);
        }
        if (customEndDate) {
          const [eYear, eMonth, eDay] = customEndDate.split("-").map(Number);
          endDate = new Date(eYear, eMonth - 1, eDay, 23, 59, 59, 999);
        } else {
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        }
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1, 0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    }

    return { startDate, endDate };
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const { startDate, endDate } = useMemo(() => getDateRange(), [periodFilter, customStartDate, customEndDate]);

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const txDate = new Date(tx.transaction_date);
      return txDate >= startDate && txDate <= endDate;
    });
  }, [transactions, startDate, endDate]);

  // Calculate monthly cashflow
  const cashflowData = useMemo(() => {
    const monthlyMap = new Map<string, { income: number; expense: number }>();

    // Init months in range
    const current = new Date(startDate);
    while (current <= endDate) {
      const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`;
      monthlyMap.set(key, { income: 0, expense: 0 });
      current.setMonth(current.getMonth() + 1);
    }

    filteredTransactions.forEach(tx => {
      const key = tx.transaction_date.substring(0, 7);
      const existing = monthlyMap.get(key) || { income: 0, expense: 0 };
      if (tx.type === "income") {
        existing.income += Number(tx.amount);
      } else {
        existing.expense += Number(tx.amount);
      }
      monthlyMap.set(key, existing);
    });

    return Array.from(monthlyMap.entries())
      .map(([month, values]) => {
        const [year, monthNum] = month.split("-");
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
        return {
          month: `${monthNames[parseInt(monthNum) - 1]} ${year.slice(-2)}`,
          income: values.income,
          expense: values.expense,
          net: values.income - values.expense
        };
      });
  }, [startDate, endDate, filteredTransactions]);

  // Category breakdown for expenses
  const categoryBreakdown = useMemo(() => {
    const expenseTx = filteredTransactions.filter(tx => tx.type === "expense");
    const categoryMap = new Map<string, { amount: number; color: string }>();

    expenseTx.forEach(tx => {
      const catName = tx.categories?.[0]?.name || "Tanpa Kategori";
      const catColor = tx.categories?.[0]?.color || "#71717a";
      const existing = categoryMap.get(catName) || { amount: 0, color: catColor };
      existing.amount += Number(tx.amount);
      categoryMap.set(catName, existing);
    });

    const total = Array.from(categoryMap.values()).reduce((sum, cat) => sum + cat.amount, 0);

    return Array.from(categoryMap.entries())
      .map(([name, values]) => ({
        name,
        amount: values.amount,
        color: values.color,
        percentage: total > 0 ? (values.amount / total) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions]);

  // Summaries
  const { totalIncome, totalExpense, netCashflow } = useMemo(() => {
    const totalInc = filteredTransactions.filter(tx => tx.type === "income").reduce((sum, tx) => sum + Number(tx.amount), 0);
    const totalExp = filteredTransactions.filter(tx => tx.type === "expense").reduce((sum, tx) => sum + Number(tx.amount), 0);
    return {
      totalIncome: totalInc,
      totalExpense: totalExp,
      netCashflow: totalInc - totalExp
    };
  }, [filteredTransactions]);

  const { currentWalletsTotal, currentDebtsOwe } = useMemo(() => {
    const walletsTotal = wallets.reduce((sum, w) => sum + Number(w.balance), 0);
    const debtsOwe = debts
      .filter(d => d.type === "owe" && d.status === "unpaid")
      .reduce((sum, d) => sum + (Number(d.total_amount) - Number(d.paid_amount)), 0);
    return {
      currentWalletsTotal: walletsTotal,
      currentDebtsOwe: debtsOwe
    };
  }, [wallets, debts]);

  // Format Helpers
  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  const formatPercentage = (val: number) => {
    return val.toFixed(1) + "%";
  };

  const handleExportPDF = () => {
    exportToPDF({
      startDate,
      endDate,
      totalIncome,
      totalExpense,
      netCashflow,
      currentWalletsTotal,
      currentDebtsOwe,
      categoryBreakdown,
      filteredTransactions,
      formatIDR,
      formatPercentage,
      showSuccessToast,
      showErrorToast,
      setExportingPDF
    });
  };

  const handleExportExcel = () => {
    exportToExcel({
      startDate,
      endDate,
      totalIncome,
      totalExpense,
      netCashflow,
      currentWalletsTotal,
      currentDebtsOwe,
      categoryBreakdown,
      filteredTransactions,
      showSuccessToast,
      showErrorToast,
      setExportingExcel
    });
  };

  if (loading) {
    return <SkeletonTable rows={8} cols={5} className="mt-6" />;
  }

  if (errorMsg) {
    return <div className="text-center py-10 text-danger">{errorMsg}</div>;
  }

  return (
    <div className="space-y-6 font-sans">
      <ReportsHeader
        exportingExcel={exportingExcel}
        exportingPDF={exportingPDF}
        onExportExcel={handleExportExcel}
        onExportPDF={handleExportPDF}
      />

      <PeriodFilter
        periodFilter={periodFilter}
        setPeriodFilter={setPeriodFilter}
        customStartDate={customStartDate}
        setCustomStartDate={setCustomStartDate}
        customEndDate={customEndDate}
        setCustomEndDate={setCustomEndDate}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      <SummaryCards
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        netCashflow={netCashflow}
        currentWalletsTotal={currentWalletsTotal}
        formatIDR={formatIDR}
      />

      {viewMode === "visual" ? (
        <ReportsCharts
          cashflowData={cashflowData}
          categoryBreakdown={categoryBreakdown}
          formatIDR={formatIDR}
          chartColors={CHART_COLORS}
        />
      ) : (
        <ReportsTables
          cashflowData={cashflowData}
          categoryBreakdown={categoryBreakdown}
          formatIDR={formatIDR}
          formatPercentage={formatPercentage}
        />
      )}
    </div>
  );
}

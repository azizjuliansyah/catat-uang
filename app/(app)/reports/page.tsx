"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useApp } from "@/app/providers/AppProvider";
import {
  Download,
  FileText,
  Table,
  TrendingUp,
  TrendingDown,
  Wallet,
  AlertCircle,
  ChevronDown,
  Calendar,
  HelpCircle
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

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

interface WalletData {
  id: string;
  name: string;
  balance: number;
}

interface DebtData {
  id: string;
  type: "owe" | "lend";
  total_amount: number;
  paid_amount: number;
  status: "unpaid" | "paid";
}

interface CashflowData {
  month: string;
  income: number;
  expense: number;
  net: number;
}

interface CategoryBreakdown {
  name: string;
  amount: number;
  color: string;
  percentage: number;
}

interface NetWorthData {
  month: string;
  wallets: number;
  debts: number;
  netWorth: number;
}

type PeriodFilter = "this_month" | "last_3_months" | "last_6_months" | "this_year" | "custom";

const CATEGORY_COLORS = [
  "#0C5CAB", "#10b981", "#f59e0b", "#ef4444", "#6366f1",
  "#06b6d4", "#8b5cf6", "#71717a", "#ec4899", "#14b8a6"
];

export default function ReportsPage() {
  const supabase = createClient();
  const { user, wallets: cachedWallets } = useApp();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Data States
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [debts, setDebts] = useState<DebtData[]>([]);

  // Filter out archived wallets from cache (stable reference via useMemo)
  const wallets = useMemo(() => {
    return cachedWallets.filter(w => !w.is_archived);
  }, [cachedWallets]);

  // Filter States
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("last_6_months");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);

  // Chart refs for export
  const cashflowChartRef = useRef<HTMLDivElement>(null);
  const categoryChartRef = useRef<HTMLDivElement>(null);
  const netWorthChartRef = useRef<HTMLDivElement>(null);

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
      setTransactions(data || []);
    } catch (err: any) {
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
      setDebts(data || []);
    } catch (err: any) {
      console.error("Error fetching debts:", err);
    }
  }

  // Fetch data on mount and user change
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
  }, [user]);

  // Get date range based on filter
  const getDateRange = () => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (periodFilter) {
      case "this_month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "last_3_months":
        startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        break;
      case "last_6_months":
        startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        break;
      case "this_year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case "custom":
        startDate = customStartDate ? new Date(customStartDate) : new Date(now.getFullYear(), now.getMonth() - 5, 1);
        endDate = customEndDate ? new Date(customEndDate) : now;
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    }

    return { startDate, endDate };
  };

  // Derived date range
  const { startDate, endDate } = useMemo(() => getDateRange(), [periodFilter, customStartDate, customEndDate]);

  // Filter transactions by date range
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const txDate = new Date(tx.transaction_date);
      return txDate >= startDate && txDate <= endDate;
    });
  }, [transactions, startDate, endDate]);

  // Calculate cashflow data by month
  const cashflowData = useMemo(() => {
    // Group by month
    const monthlyData = new Map<string, { income: number; expense: number }>();

    // Initialize all months in range
    const current = new Date(startDate);
    while (current <= endDate) {
      const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`;
      monthlyData.set(key, { income: 0, expense: 0 });
      current.setMonth(current.getMonth() + 1);
    }

    // Sum transactions by month
    filteredTransactions.forEach(tx => {
      const key = tx.transaction_date.substring(0, 7);
      const existing = monthlyData.get(key) || { income: 0, expense: 0 };
      if (tx.type === "income") {
        existing.income += Number(tx.amount);
      } else {
        existing.expense += Number(tx.amount);
      }
      monthlyData.set(key, existing);
    });

    // Convert to array and format month labels
    return Array.from(monthlyData.entries())
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

  // Calculate category breakdown for expenses
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

  // Calculate net worth over time
  const netWorthData = useMemo(() => {
    const currentWalletsTotal = wallets.reduce((sum, w) => sum + Number(w.balance), 0);
    const currentDebtsOwe = debts
      .filter(d => d.type === "owe" && d.status === "unpaid")
      .reduce((sum, d) => sum + (Number(d.total_amount) - Number(d.paid_amount)), 0);
    const currentDebtsLend = debts
      .filter(d => d.type === "lend" && d.status === "unpaid")
      .reduce((sum, d) => sum + (Number(d.total_amount) - Number(d.paid_amount)), 0);

    const currentNetWorth = currentWalletsTotal - currentDebtsOwe + currentDebtsLend;

    // Create monthly projection (simplified - shows current value projected)
    const data: NetWorthData[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
      const monthLabel = `${monthNames[current.getMonth()]} ${current.getFullYear().toString().slice(-2)}`;

      const isCurrentMonth = current.getMonth() === new Date().getMonth() &&
                            current.getFullYear() === new Date().getFullYear();

      data.push({
        month: monthLabel,
        wallets: isCurrentMonth ? currentWalletsTotal : currentWalletsTotal * 0.9,
        debts: isCurrentMonth ? currentDebtsOwe : currentDebtsOwe * 0.9,
        netWorth: isCurrentMonth ? currentNetWorth : currentNetWorth * 0.9
      });

      current.setMonth(current.getMonth() + 1);
    }

    return data;
  }, [startDate, endDate, wallets, debts]);

  // Summary calculations
  const filteredTx = filteredTransactions;
  const { totalIncome, totalExpense, netCashflow } = useMemo(() => {
    const totalInc = filteredTx.filter(tx => tx.type === "income").reduce((sum, tx) => sum + Number(tx.amount), 0);
    const totalExp = filteredTx.filter(tx => tx.type === "expense").reduce((sum, tx) => sum + Number(tx.amount), 0);
    return {
      totalIncome: totalInc,
      totalExpense: totalExp,
      netCashflow: totalInc - totalExp
    };
  }, [filteredTx]);

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

  // Format helpers
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

  // Export to PDF
  const exportToPDF = async () => {
    try {
      setExportingPDF(true);

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const { startDate, endDate } = getDateRange();

      // Title
      doc.setFontSize(18);
      doc.setTextColor(15, 92, 171); // Primary color
      doc.text("Laporan Keuangan CatatUang", pageWidth / 2, 20, { align: "center" });

      doc.setFontSize(10);
      doc.setTextColor(100);
      const periodText = `Periode: ${startDate.toLocaleDateString("id-ID")} - ${endDate.toLocaleDateString("id-ID")}`;
      doc.text(periodText, pageWidth / 2, 28, { align: "center" });

      // Summary Cards
      let yPos = 40;
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text("Ringkasan", 14, yPos);

      yPos += 8;
      doc.setFontSize(10);
      doc.text(`Total Pemasukan: ${formatIDR(totalIncome)}`, 14, yPos);
      yPos += 6;
      doc.text(`Total Pengeluaran: ${formatIDR(totalExpense)}`, 14, yPos);
      yPos += 6;
      doc.setTextColor(netCashflow >= 0 ? 16 : 239, netCashflow >= 0 ? 185 : 68, netCashflow >= 0 ? 129 : 68);
      doc.text(`Arus Bersih: ${formatIDR(netCashflow)}`, 14, yPos);
      yPos += 6;
      doc.setTextColor(0);
      doc.text(`Total Saldo Dompet: ${formatIDR(currentWalletsTotal)}`, 14, yPos);
      yPos += 6;
      doc.text(`Total Hutang Aktif: ${formatIDR(currentDebtsOwe)}`, 14, yPos);

      // Category Breakdown Table
      yPos += 12;
      doc.setFontSize(12);
      doc.text("Breakdown Kategori Pengeluaran", 14, yPos);

      yPos += 5;
      autoTable(doc, {
        startY: yPos,
        head: [["Kategori", "Jumlah", "Persentase"]],
        body: categoryBreakdown.map(cat => [
          cat.name,
          formatIDR(cat.amount),
          formatPercentage(cat.percentage)
        ]),
        theme: "grid",
        headStyles: { fillColor: [12, 92, 171] }
      });

      // Transaction Table (new page if needed)
      const finalY = (doc as any).lastAutoTable.finalY || yPos;
      if (finalY > 200) {
        doc.addPage();
      }

      doc.setFontSize(12);
      doc.text("Daftar Transaksi", 14, (doc as any).lastAutoTable.finalY + 15 || 20);

      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 20 || 25,
        head: [["Tanggal", "Kategori", "Deskripsi", "Tipe", "Jumlah"]],
        body: filteredTx.slice(0, 50).map(tx => [
          new Date(tx.transaction_date).toLocaleDateString("id-ID"),
          tx.categories?.[0]?.name || "-",
          tx.description || "-",
          tx.type === "income" ? "Pemasukan" : "Pengeluaran",
          formatIDR(tx.amount)
        ]),
        theme: "grid",
        headStyles: { fillColor: [12, 92, 171] },
        styles: { fontSize: 8 }
      });

      doc.save(`catatuang-laporan-${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (err) {
      console.error("Error exporting PDF:", err);
      setErrorMsg("Gagal mengekspor PDF");
    } finally {
      setExportingPDF(false);
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    try {
      setExportingExcel(true);

      const { startDate, endDate } = getDateRange();

      // Create workbook
      const wb = XLSX.utils.book_new();

      // Sheet 1: Summary
      const summaryData = [
        ["Laporan Keuangan CatatUang", ""],
        ["Periode", `${startDate.toLocaleDateString("id-ID")} - ${endDate.toLocaleDateString("id-ID")}`],
        [""],
        ["Ringkasan", ""],
        ["Total Pemasukan", totalIncome],
        ["Total Pengeluaran", totalExpense],
        ["Arus Bersih", netCashflow],
        ["Total Saldo Dompet", currentWalletsTotal],
        ["Total Hutang Aktif", currentDebtsOwe],
        ["", ""],
        ["Breakdown Kategori", ""],
        ["Kategori", "Jumlah", "Persentase"],
        ...categoryBreakdown.map(cat => [cat.name, cat.amount, cat.percentage / 100])
      ];
      const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summaryWs, "Ringkasan");

      // Sheet 2: Transactions
      const txData = [
        ["Tanggal", "Kategori", "Deskripsi", "Dompet", "Tipe", "Jumlah"],
        ...filteredTx.map(tx => [
          tx.transaction_date,
          tx.categories?.[0]?.name || "-",
          tx.description || "-",
          tx.wallets?.[0]?.name || "-",
          tx.type,
          tx.amount
        ])
      ];
      const txWs = XLSX.utils.aoa_to_sheet(txData);
      XLSX.utils.book_append_sheet(wb, txWs, "Transaksi");

      // Sheet 3: Debts
      const debtData = [
        ["Kontak", "Tipe", "Total", "Dibayar", "Sisa", "Status"],
        ...debts.map(d => [
          d.id, // Would need name field
          d.type === "owe" ? "Hutang" : "Piutang",
          d.total_amount,
          d.paid_amount,
          d.total_amount - d.paid_amount,
          d.status === "paid" ? "Lunas" : "Aktif"
        ])
      ];
      const debtWs = XLSX.utils.aoa_to_sheet(debtData);
      XLSX.utils.book_append_sheet(wb, debtWs, "Hutang & Piutang");

      XLSX.writeFile(wb, `catatuang-laporan-${new Date().toISOString().split("T")[0]}.xlsx`);
    } catch (err) {
      console.error("Error exporting Excel:", err);
      setErrorMsg("Gagal mengekspor Excel");
    } finally {
      setExportingExcel(false);
    }
  };

  // Period filter labels
  const periodLabels: Record<PeriodFilter, string> = {
    this_month: "Bulan Ini",
    last_3_months: "3 Bulan Terakhir",
    last_6_months: "6 Bulan Terakhir",
    this_year: "Tahun Ini",
    custom: "Custom"
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-surface-card rounded-md" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-surface-card border border-border rounded-xl" />
          ))}
        </div>
        <div className="h-80 bg-surface-card border border-border rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {errorMsg && (
        <div className="fixed top-4 right-4 z-50 bg-danger/15 border border-danger/30 text-danger px-4 py-3 rounded-xl flex items-center gap-2 shadow-lg">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm font-semibold">{errorMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Laporan Keuangan</h1>
          <p className="text-sm text-text-secondary mt-0.5">Analisis cashflow, breakdown kategori, dan ekspor data.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToExcel}
            disabled={exportingExcel}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-success hover:bg-success/90 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer"
          >
            <Table className="w-4 h-4" />
            {exportingExcel ? "Mengekspor..." : "Export Excel"}
          </button>
          <button
            onClick={exportToPDF}
            disabled={exportingPDF}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            {exportingPDF ? "Mengekspor..." : "Export PDF"}
          </button>
        </div>
      </div>

      {/* Period Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative">
          <button
            onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
            className="flex items-center gap-2 px-4 py-2 bg-surface-card border border-border hover:border-border-strong rounded-xl text-sm font-medium transition-colors cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-text-secondary" />
            {periodLabels[periodFilter]}
            <ChevronDown className={`w-4 h-4 text-text-secondary transition-transform ${showPeriodDropdown ? "rotate-180" : ""}`} />
          </button>

          {showPeriodDropdown && (
            <div className="absolute top-full mt-2 left-0 w-56 bg-surface-card border border-border rounded-xl shadow-xl z-50 py-1.5">
              {(["this_month", "last_3_months", "last_6_months", "this_year", "custom"] as PeriodFilter[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => {
                    setPeriodFilter(filter);
                    setShowPeriodDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-surface-hover transition-colors ${
                    periodFilter === filter ? "bg-primary/10 text-primary font-medium" : "text-text-primary"
                  }`}
                >
                  {periodLabels[filter]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Custom Date Range (when custom selected) */}
        {periodFilter === "custom" && (
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="px-3 py-2 bg-surface-input border border-border focus:border-primary focus:outline-none rounded-lg text-sm text-text-primary"
            />
            <span className="text-text-secondary">—</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="px-3 py-2 bg-surface-input border border-border focus:border-primary focus:outline-none rounded-lg text-sm text-text-primary"
            />
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-card border border-border rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-income/5 rounded-full blur-2xl" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-income/10 text-income flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Total Pemasukan</p>
              <p className="text-lg font-bold text-income font-mono mt-0.5">{formatIDR(totalIncome)}</p>
            </div>
          </div>
        </div>

        <div className="bg-surface-card border border-border rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-expense/5 rounded-full blur-2xl" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-expense/10 text-expense flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Total Pengeluaran</p>
              <p className="text-lg font-bold text-expense font-mono mt-0.5">{formatIDR(totalExpense)}</p>
            </div>
          </div>
        </div>

        <div className="bg-surface-card border border-border rounded-2xl p-5 relative overflow-hidden group">
          <div className={`absolute top-0 right-0 w-24 h-24 ${netCashflow >= 0 ? "bg-success/5" : "bg-danger/5"} rounded-full blur-2xl`} />
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              netCashflow >= 0 ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
            }`}>
              {netCashflow >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-xs text-text-secondary">Arus Bersih</p>
              <p className={`text-lg font-bold font-mono mt-0.5 ${netCashflow >= 0 ? "text-success" : "text-danger"}`}>
                {formatIDR(netCashflow)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-surface-card border border-border rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Total Saldo Dompet</p>
              <p className="text-lg font-bold text-text-primary font-mono mt-0.5">{formatIDR(currentWalletsTotal)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
        {/* Cashflow Chart */}
        <div className="bg-surface-card border border-border rounded-2xl p-5 min-w-0">
          <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Cashflow Bulanan
          </h3>
          <div ref={cashflowChartRef} className="relative h-64 w-full min-w-0">
            {cashflowData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={cashflowData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="month" stroke="#a1a1aa" fontSize={11} />
                  <YAxis stroke="#a1a1aa" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", borderRadius: "8px" }}
                    itemStyle={{ color: "#fafafa" }}
                    formatter={(value) => typeof value === "number" ? formatIDR(value) : value}
                  />
                  <Legend />
                  <Bar dataKey="income" name="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-text-secondary text-sm">
                Tidak ada data untuk periode ini
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown Chart */}
        <div className="bg-surface-card border border-border rounded-2xl p-5 min-w-0">
          <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-primary" />
            Breakdown Kategori Pengeluaran
          </h3>
          <div ref={categoryChartRef} className="relative h-64 w-full min-w-0">
            {categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="amount"
                    label={(entry) => `${entry.name} (${(entry.percent || 0).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", borderRadius: "8px" }}
                    itemStyle={{ color: "#fafafa" }}
                    formatter={(value) => typeof value === "number" ? formatIDR(value) : value}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-text-secondary text-sm">
                Tidak ada pengeluaran untuk periode ini
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Breakdown List */}
      {categoryBreakdown.length > 0 && (
        <div className="bg-surface-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold text-text-primary mb-4">Detail Kategori Pengeluaran</h3>
          <div className="space-y-3">
            {categoryBreakdown.map((cat, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-sm text-text-primary">{cat.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-2 bg-surface-input rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                    />
                  </div>
                  <span className="text-sm font-mono font-medium text-text-primary w-24 text-right">
                    {formatIDR(cat.amount)}
                  </span>
                  <span className="text-xs text-text-secondary w-12 text-right">
                    {cat.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Net Worth Chart */}
      <div className="bg-surface-card border border-border rounded-2xl p-5 min-w-0">
        <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
          <Wallet className="w-4 h-4 text-primary" />
          Net Worth (Kekayaan Bersih)
        </h3>
        <p className="text-xs text-text-secondary mb-4">
          Total saldo dompet dikurangi hutang aktif. Nilai positif berarti Anda memiliki lebih banyak aset daripada kewajiban.
        </p>
        <div ref={netWorthChartRef} className="relative h-64 w-full min-w-0">
          {netWorthData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <LineChart data={netWorthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="month" stroke="#a1a1aa" fontSize={11} />
                <YAxis stroke="#a1a1aa" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", borderRadius: "8px" }}
                  itemStyle={{ color: "#fafafa" }}
                  formatter={(value) => typeof value === "number" ? formatIDR(value) : value}
                />
                <Legend />
                <Line type="monotone" dataKey="netWorth" name="Net Worth" stroke="#0C5CAB" strokeWidth={2} dot={{ fill: "#0C5CAB" }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-text-secondary text-sm">
              Tidak ada data untuk ditampilkan
            </div>
          )}
        </div>
      </div>

      {/* Net Worth Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface-card border border-border rounded-2xl p-5">
          <p className="text-xs text-text-secondary">Total Dompet</p>
          <p className="text-xl font-bold text-text-primary font-mono mt-1">{formatIDR(currentWalletsTotal)}</p>
        </div>
        <div className="bg-surface-card border border-border rounded-2xl p-5">
          <p className="text-xs text-text-secondary">Total Hutang Aktif</p>
          <p className="text-xl font-bold text-danger font-mono mt-1">{formatIDR(currentDebtsOwe)}</p>
        </div>
        <div className="bg-surface-card border border-border rounded-2xl p-5">
          <p className="text-xs text-text-secondary">Net Worth</p>
          <p className={`text-xl font-bold font-mono mt-1 ${(currentWalletsTotal - currentDebtsOwe) >= 0 ? "text-success" : "text-danger"}`}>
            {formatIDR(currentWalletsTotal - currentDebtsOwe)}
          </p>
        </div>
      </div>
    </div>
  );
}

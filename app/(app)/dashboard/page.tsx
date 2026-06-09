"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getIconComponent } from "@/lib/utils/icons";
import { useApp } from "@/app/providers/AppProvider";
import {
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  Wallet,
  PiggyBank,
  AlertCircle,
  Plus,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  HelpCircle
} from "lucide-react";

interface WalletData {
  id: string;
  name: string;
  balance: number;
  icon: string;
  color: string;
  is_default: boolean;
}

interface Transaction {
  id: string;
  amount: number;
  type: "income" | "expense";
  description: string | null;
  transaction_date: string;
  wallets: {
    name: string;
  } | null;
  categories: {
    name: string;
    icon: string;
    color: string;
  } | null;
}

export default function DashboardPage() {
  const supabase = createClient();
  const { user, wallets: allWallets, loadingUser, loadingWallets } = useApp();
  const wallets = allWallets.filter((w) => !w.is_archived);

  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
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
        // Calculate date boundaries for current month in local timezone representation
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const startDateStr = `${year}-${month}-01`;
        
        const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
        const endDateStr = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;

        // Fetch current month's transactions for summary calculations
        const { data: monthTx, error: monthTxError } = await supabase
          .from("transactions")
          .select("amount, type")
          .eq("user_id", user.id)
          .gte("transaction_date", startDateStr)
          .lte("transaction_date", endDateStr);

        if (monthTxError) throw monthTxError;

        let incomeSum = 0;
        let expenseSum = 0;
        if (monthTx) {
          monthTx.forEach((tx) => {
            if (tx.type === "income") {
              incomeSum += Number(tx.amount);
            } else if (tx.type === "expense") {
              expenseSum += Number(tx.amount);
            }
          });
        }
        setCurrentMonthIncome(incomeSum);
        setCurrentMonthExpense(expenseSum);

        // Fetch 5 most recent transactions
        const { data: recentTx, error: recentTxError } = await supabase
          .from("transactions")
          .select(`
            id,
            amount,
            type,
            description,
            transaction_date,
            wallets (name),
            categories (name, icon, color)
          `)
          .eq("user_id", user.id)
          .order("transaction_date", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(5);

        if (recentTxError) throw recentTxError;
        setRecentTransactions((recentTx as any[]) || []);

      } catch (err: any) {
        console.error("Error loading dashboard transaction data:", err);
        setErrorMsg("Gagal memuat data transaksi: " + err.message);
      } finally {
        setLoadingTx(false);
      }
    }

    loadDashboardTxData();
  }, [supabase, user]);

  const totalBalance = wallets.reduce((sum, w) => sum + Number(w.balance), 0);
  const netCashflow = currentMonthIncome - currentMonthExpense;

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  const formatDateShort = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short"
    });
  };

  const isLoading = loadingUser || loadingWallets || (user && loadingTx);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-surface-card rounded-md" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-surface-card border border-border rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 h-80 bg-surface-card border border-border rounded-xl" />
          <div className="lg:col-span-2 h-80 bg-surface-card border border-border rounded-xl" />
        </div>
      </div>
    );
  }

  // If no wallets exist, display start guide/empty state
  if (wallets.length === 0) {
    return (
      <div className="max-w-2xl mx-auto space-y-8 py-10">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight text-text-primary animate-fade-in">
            Selamat Datang di CatatUang!
          </h1>
          <p className="text-sm text-text-secondary max-w-md mx-auto">
            Aplikasi pencatatan keuangan pribadi Anda. Mari mulai kelola finansial Anda dengan beberapa langkah mudah.
          </p>
        </div>

        <div className="bg-surface-card border border-border rounded-xl p-8 shadow-sm space-y-6 hover:shadow transition-shadow">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <PiggyBank className="w-8 h-8" />
            </div>
          </div>

          <div className="space-y-4 max-w-md mx-auto text-center">
            <h2 className="text-lg font-bold text-text-primary">
              Mulai Langkah Pertama Anda
            </h2>
            <p className="text-xs text-text-secondary leading-relaxed">
              Anda belum memiliki dompet aktif. Dompet digunakan sebagai sumber dana transaksi pengeluaran dan tujuan transaksi pemasukan Anda (seperti Dompet Tunai, Rekening Bank, atau E-Wallet).
            </p>
          </div>

          <div className="flex justify-center pt-4">
            <Link
              href="/wallets"
              className="px-6 py-3 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Buat Dompet Pertama
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome & Quick Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Halo, {user?.user_metadata?.name || user?.email?.split("@")[0] || "Pengguna"}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Berikut adalah ringkasan kesehatan keuangan Anda di bulan ini.
          </p>
        </div>

        <Link
          href="/transactions/new"
          className="px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5 self-stretch sm:self-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          Transaksi Baru
        </Link>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded-lg flex items-start gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span className="text-xs font-medium">{errorMsg}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Balance */}
        <div className="bg-surface-card border border-border p-4 rounded-xl flex items-center gap-4 shadow-sm relative overflow-hidden group hover:border-border-strong hover:shadow transition-all">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-primary" />
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xxs font-bold text-text-secondary uppercase tracking-wider truncate">Total Saldo</p>
            <p className="text-lg font-bold font-mono text-text-primary mt-0.5 truncate">{formatIDR(totalBalance)}</p>
          </div>
        </div>

        {/* Current Month Income */}
        <div className="bg-surface-card border border-border p-4 rounded-xl flex items-center gap-4 shadow-sm relative overflow-hidden group hover:border-border-strong hover:shadow transition-all">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-income" />
          <div className="w-10 h-10 rounded-lg bg-income/10 text-income flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xxs font-bold text-text-secondary uppercase tracking-wider truncate">Pemasukan Bulan Ini</p>
            <p className="text-lg font-bold font-mono text-income mt-0.5 truncate">{formatIDR(currentMonthIncome)}</p>
          </div>
        </div>

        {/* Current Month Expense */}
        <div className="bg-surface-card border border-border p-4 rounded-xl flex items-center gap-4 shadow-sm relative overflow-hidden group hover:border-border-strong hover:shadow transition-all">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-expense" />
          <div className="w-10 h-10 rounded-lg bg-expense/10 text-expense flex items-center justify-center shrink-0">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xxs font-bold text-text-secondary uppercase tracking-wider truncate">Pengeluaran Bulan Ini</p>
            <p className="text-lg font-bold font-mono text-expense mt-0.5 truncate">{formatIDR(currentMonthExpense)}</p>
          </div>
        </div>

        {/* Net Flow */}
        <div className="bg-surface-card border border-border p-4 rounded-xl flex items-center gap-4 shadow-sm relative overflow-hidden group hover:border-border-strong hover:shadow transition-all">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-amber-500" />
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
            netCashflow >= 0 ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
          }`}>
            {netCashflow >= 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
          </div>
          <div className="min-w-0">
            <p className="text-xxs font-bold text-text-secondary uppercase tracking-wider truncate">Arus Bersih (Net)</p>
            <p className={`text-lg font-bold font-mono mt-0.5 truncate ${
              netCashflow >= 0 ? "text-success" : "text-danger"
            }`}>{formatIDR(netCashflow)}</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Wallets (Left) & Recent Transactions (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Wallets Column */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-primary" />
              Dompet Saya
            </h2>
            <Link
              href="/wallets"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              Kelola <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {wallets.map((wallet) => {
              const WalletIconComponent = getIconComponent(wallet.icon);
              return (
                <div
                  key={wallet.id}
                  className="bg-surface-card border border-border hover:border-border-strong rounded-xl p-4 flex items-center justify-between shadow-sm hover:shadow transition-all group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: wallet.color }}
                    >
                      <WalletIconComponent className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-text-primary truncate">
                        {wallet.name}
                      </p>
                      <p className="text-xxs text-text-secondary mt-0.5">
                        {wallet.is_default ? "Dompet Utama" : "Dompet Aktif"}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold font-mono text-text-primary">
                      {formatIDR(wallet.balance)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Transactions Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
              <ArrowRightLeft className="w-4 h-4 text-primary" />
              Transaksi Terakhir
            </h2>
            <Link
              href="/transactions"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              Semua Transaksi <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-surface-card border border-border rounded-xl overflow-hidden shadow-sm">
            {recentTransactions.length > 0 ? (
              <div className="divide-y divide-border/50">
                {recentTransactions.map((tx) => {
                  const CategoryIconComponent = tx.categories
                    ? getIconComponent(tx.categories.icon)
                    : HelpCircle;
                  return (
                    <Link
                      key={tx.id}
                      href={`/transactions/${tx.id}`}
                      className="flex items-center justify-between p-4 hover:bg-surface-hover transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        {/* Category Icon */}
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0"
                          style={{
                            backgroundColor: tx.categories?.color || "#6B7280"
                          }}
                        >
                          <CategoryIconComponent className="w-5 h-5" />
                        </div>

                        {/* Title and Date info */}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors truncate">
                            {tx.description || tx.categories?.name || "Tanpa Kategori"}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-xxs text-text-secondary">
                            <span className="flex items-center gap-0.5">
                              <Calendar className="w-3 h-3" />
                              {formatDateShort(tx.transaction_date)}
                            </span>
                            <span>•</span>
                            <span className="truncate max-w-[120px]">
                              {tx.wallets?.name || "Dompet Terhapus"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="ml-4 shrink-0 text-right flex items-center gap-2">
                        <span className={`text-sm font-bold font-mono ${
                          tx.type === "income" ? "text-income" : "text-expense"
                        }`}>
                          {tx.type === "income" ? "+" : "-"} {formatIDR(tx.amount)}
                        </span>
                        <ChevronRight className="w-4 h-4 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center space-y-3">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-surface-input text-text-secondary">
                  <ArrowRightLeft className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-text-primary">
                  Belum ada transaksi
                </h3>
                <p className="text-xs text-text-secondary max-w-sm mx-auto">
                  Belum ada catatan transaksi pengeluaran atau pemasukan yang Anda buat.
                </p>
                <div className="pt-2">
                  <Link
                    href="/transactions/new"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Buat Transaksi Pertama
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

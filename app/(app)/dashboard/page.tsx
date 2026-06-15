"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useApp } from "@/app/providers/AppProvider";
import { EmptyState } from "@/components/ui/organisms/EmptyState";
import { PiggyBank, AlertCircle } from "lucide-react";

import { DashboardHeader } from "./components/DashboardHeader";
import { DashboardStats } from "./components/DashboardStats";
import { DashboardWallets } from "./components/DashboardWallets";
import { DashboardRecentTransactions } from "./components/DashboardRecentTransactions";
import { DashboardSkeleton } from "./components/DashboardSkeleton";

interface Transaction {
  id: string;
  amount: number;
  type: "income" | "expense";
  description: string | null;
  transaction_date: string;
  wallets: {
    name: string;
  } | null;
  paylater_platforms: {
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
  const router = useRouter();
  const { 
    user, 
    wallets: allWallets, 
    paylaterPlatforms,
    loadingUser, 
    loadingWallets,
    loadingPaylaterPlatforms
  } = useApp();
  const wallets = allWallets.filter((w) => !w.is_archived);
  const activePaylater = paylaterPlatforms.filter((p) => !p.is_archived);

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
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const startDateStr = `${year}-${month}-01`;
        
        const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
        const endDateStr = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;

        const startISO = new Date(`${startDateStr}T00:00:00`).toISOString();
        const endISO = new Date(`${endDateStr}T23:59:59.999`).toISOString();

        const { data: monthTx, error: monthTxError } = await supabase
          .from("transactions")
          .select("amount, type")
          .eq("user_id", user.id)
          .gte("transaction_date", startISO)
          .lte("transaction_date", endISO);

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

        const { data: recentTx, error: recentTxError } = await supabase
          .from("transactions")
          .select(`
            id,
            amount,
            type,
            description,
            transaction_date,
            wallets (name),
            paylater_platforms (name),
            categories (name, icon, color)
          `)
          .eq("user_id", user.id)
          .order("transaction_date", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(5);

        if (recentTxError) throw recentTxError;
        setRecentTransactions((recentTx as unknown as Transaction[]) || []);

      } catch (err: unknown) {
        console.error("Error loading dashboard transaction data:", err);
        const message = err instanceof Error ? err.message : String(err);
        setErrorMsg("Gagal memuat data transaksi: " + message);
      } finally {
        setLoadingTx(false);
      }
    }

    loadDashboardTxData();
  }, [supabase, user]);

  const totalBalance = wallets.reduce((sum, w) => sum + Number(w.balance), 0);
  const totalPaylaterDebt = activePaylater.reduce((sum, p) => sum + Number(p.balance), 0);
  const netCashflow = currentMonthIncome - currentMonthExpense;
  const isLoading = loadingUser || loadingWallets || loadingPaylaterPlatforms || (user && loadingTx);

  if (isLoading) return <DashboardSkeleton />;

  if (wallets.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 flex flex-col items-center justify-center font-sans">
        <EmptyState
          icon={PiggyBank}
          title="Selamat Datang di CatatUang!"
          description="Anda belum memiliki dompet aktif. Dompet digunakan sebagai sumber dana transaksi pengeluaran dan tujuan pemasukan Anda (seperti Tunai, Rekening Bank, atau E-Wallet)."
          actionLabel="Buat Dompet Pertama"
          onAction={() => router.push("/wallets")}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Welcome & Quick Action Header */}
      <DashboardHeader user={user} />

      {/* Error Alert */}
      {errorMsg && (
        <div className="bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded-lg flex items-start gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span className="text-xs font-medium">{errorMsg}</span>
        </div>
      )}

      {/* Bento Grid Summary Cards */}
      <DashboardStats
        totalBalance={totalBalance}
        currentMonthIncome={currentMonthIncome}
        currentMonthExpense={currentMonthExpense}
        netCashflow={netCashflow}
        totalPaylaterDebt={totalPaylaterDebt}
      />

      {/* Main Grid: Wallets (Left) & Recent Transactions (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <DashboardWallets wallets={wallets} />
        </div>

        <div className="lg:col-span-2">
          <DashboardRecentTransactions recentTransactions={recentTransactions} />
        </div>
      </div>
    </div>
  );
}

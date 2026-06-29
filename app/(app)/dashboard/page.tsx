"use client";

import { useRouter } from "next/navigation";
import { useApp } from "@/app/providers/AppProvider";
import { EmptyState } from "@/components/ui/organisms/EmptyState";
import { PiggyBank, AlertCircle } from "lucide-react";

import { DashboardHeader } from "./components/DashboardHeader";
import { DashboardStats } from "./components/DashboardStats";
import { DashboardWallets } from "./components/DashboardWallets";
import { DashboardRecentTransactions } from "./components/DashboardRecentTransactions";
import { useDashboardData } from "./hooks/useDashboardData";

export default function DashboardPage() {
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

  const {
    recentTransactions,
    currentMonthIncome,
    currentMonthExpense,
    loadingTx,
    errorMsg,
  } = useDashboardData();

  const totalBalance = wallets.reduce((sum, w) => sum + Number(w.balance), 0);
  const totalPaylaterDebt = activePaylater.reduce((sum, p) => sum + Number(p.balance), 0);
  const netCashflow = currentMonthIncome - currentMonthExpense;

  // Show empty state if no wallets after loading completes
  const isInitialLoad = loadingUser || loadingWallets || loadingPaylaterPlatforms;
  if (!isInitialLoad && wallets.length === 0) {
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
        isLoading={loadingTx}
      />

      {/* Main Grid: Wallets (Left) & Recent Transactions (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <DashboardWallets wallets={wallets} isLoading={loadingWallets} />
        </div>

        <div className="lg:col-span-2">
          <DashboardRecentTransactions recentTransactions={recentTransactions} isLoading={loadingTx} />
        </div>
      </div>
    </div>
  );
}

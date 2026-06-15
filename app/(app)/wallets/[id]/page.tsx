"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useApp } from "@/app/providers/AppProvider";
import { TransactionDetailModal } from "@/components/ui/organisms/TransactionDetailModal";
import { Button } from "@/components/ui/atoms/Button";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  HelpCircle,
  Wallet as WalletIcon,
  Tag,
  Clock,
  FileText,
  Plus
} from "lucide-react";
import { formatIDR } from "@/lib/utils/format";
import { getIconComponent } from "@/lib/utils/icons";

interface Transaction {
  id: string;
  user_id: string;
  wallet_id: string | null;
  paylater_id: string | null;
  category_id: string | null;
  amount: number;
  type: "income" | "expense";
  description: string | null;
  transaction_date: string;
  receipt_url: string | null;
  created_at: string;
  wallets: { name: string; icon: string; color: string } | null;
  paylater_platforms: { name: string; color: string; icon: string } | null;
  categories: { name: string; icon: string; color: string } | null;
}

function formatDateGroup(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function WalletDetailPage() {
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
        router.push("/auth/login");
      } else {
        loadTransactions();
      }
    }
  }, [user, loadingUser, loadTransactions, router]);

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);
  const netFlow = totalIncome - totalExpense;

  const groupedTransactions: { [date: string]: Transaction[] } = {};
  transactions.forEach((tx) => {
    const date = tx.transaction_date.split("T")[0];
    if (!groupedTransactions[date]) groupedTransactions[date] = [];
    groupedTransactions[date].push(tx);
  });
  const uniqueDates = Object.keys(groupedTransactions);

  const isPageLoading = loadingUser || loadingWallets || loading;

  if (isPageLoading) {
    return (
      <div className="space-y-6 font-sans pb-12">
        <div className="h-5 w-32 bg-surface-hover animate-pulse rounded-lg" />
        <div className="bg-surface-card border border-border rounded-3xl p-6 h-32 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 bg-surface-card border border-border rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-surface-card border border-border rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <WalletIcon className="w-10 h-10 text-text-muted" />
        <p className="text-sm font-semibold text-text-secondary">Dompet tidak ditemukan.</p>
        <Link href="/wallets" className="text-primary text-sm hover:underline">
          Kembali ke Dompet
        </Link>
      </div>
    );
  }

  const WalletIconComponent = getIconComponent(wallet.icon);

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Back navigation */}
      <Link
        href="/wallets"
        className="inline-flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Dompet
      </Link>

      {/* Wallet Header */}
      <div className="bg-gradient-to-br from-surface-card to-surface/20 border border-border rounded-3xl p-6 relative overflow-hidden">
        <div
          className="absolute top-0 left-0 right-0 h-1.5 rounded-t-3xl"
          style={{ backgroundColor: wallet.color }}
        />
        <div
          className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full blur-3xl opacity-10 pointer-events-none"
          style={{ backgroundColor: wallet.color }}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0"
              style={{ backgroundColor: wallet.color }}
            >
              <WalletIconComponent className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary tracking-tight">
                {wallet.name}
              </h1>
              {wallet.is_default && (
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full mt-1">
                  Utama
                </span>
              )}
            </div>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider">
              Saldo Saat Ini
            </p>
            <p className="text-3xl font-extrabold text-text-primary tracking-tight font-mono mt-1">
              {formatIDR(wallet.balance)}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-card border border-border p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-income" />
            <p className="text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">
              Total Pemasukan
            </p>
          </div>
          <p className="text-xl font-bold text-income font-mono">{formatIDR(totalIncome)}</p>
        </div>

        <div className="bg-surface-card border border-border p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-expense" />
            <p className="text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">
              Total Pengeluaran
            </p>
          </div>
          <p className="text-xl font-bold text-expense font-mono">{formatIDR(totalExpense)}</p>
        </div>

        <div className="bg-surface-card border border-border p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <ArrowRightLeft className="w-4 h-4 text-text-muted" />
            <p className="text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">
              Aliran Bersih
            </p>
          </div>
          <p
            className={`text-xl font-bold font-mono ${
              netFlow >= 0 ? "text-income" : "text-expense"
            }`}
          >
            {netFlow >= 0 ? "+" : ""}
            {formatIDR(Math.abs(netFlow))}
          </p>
        </div>
      </div>

      {/* Transaction History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-4 h-4" />
            Riwayat Transaksi
          </h3>
          <Link href="/transactions/new">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs flex items-center gap-1.5 border border-border px-3"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah
            </Button>
          </Link>
        </div>

        {uniqueDates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 border border-dashed border-border rounded-2xl bg-surface-card">
            <WalletIcon className="w-10 h-10 text-text-muted" />
            <p className="text-sm font-semibold text-text-secondary">Belum ada transaksi</p>
            <p className="text-xs text-text-muted text-center">
              Mulai catat transaksi pertama di dompet ini
            </p>
            <Link href="/transactions/new">
              <Button variant="primary" size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Tambah Transaksi
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {uniqueDates.map((date) => {
              const dayTransactions = groupedTransactions[date];
              const dayIncome = dayTransactions
                .filter((t) => t.type === "income")
                .reduce((s, t) => s + t.amount, 0);
              const dayExpense = dayTransactions
                .filter((t) => t.type === "expense")
                .reduce((s, t) => s + t.amount, 0);

              return (
                <div key={date} className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <h4 className="text-[10px] font-bold text-text-secondary tracking-wider uppercase font-display">
                      {formatDateGroup(date)}
                    </h4>
                    <div className="flex items-center gap-3 text-[10px] font-mono">
                      {dayIncome > 0 && (
                        <span className="text-income">+{formatIDR(dayIncome)}</span>
                      )}
                      {dayExpense > 0 && (
                        <span className="text-expense">-{formatIDR(dayExpense)}</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {dayTransactions.map((tx) => {
                      const CatIcon = tx.categories?.icon
                        ? getIconComponent(tx.categories.icon)
                        : HelpCircle;
                      const categoryColor = tx.categories?.color || "#6B7280";
                      const categoryName = tx.categories?.name || null;

                      return (
                        <div
                          key={tx.id}
                          className="bg-surface-card border border-border hover:border-border-strong rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow transition-all cursor-pointer group"
                          onClick={() => {
                            setSelectedTransaction(tx);
                            setIsDetailModalOpen(true);
                          }}
                        >
                          <div className="flex items-center gap-4 min-w-0 flex-1">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
                              style={{ backgroundColor: categoryColor }}
                            >
                              <CatIcon className="w-5 h-5" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-text-primary truncate">
                                {tx.description || categoryName || "Tanpa Kategori"}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-text-secondary bg-surface-hover/30 border border-border px-1.5 py-0.5 rounded-lg">
                                  <Clock className="w-3 h-3 text-text-muted" />
                                  {new Date(tx.transaction_date).toLocaleTimeString("id-ID", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                                {categoryName && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-text-secondary bg-surface-hover/30 border border-border px-1.5 py-0.5 rounded-lg">
                                    <Tag className="w-3 h-3 text-text-muted" />
                                    {categoryName}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <span
                            className={`text-sm font-bold font-mono ml-4 shrink-0 ${
                              tx.type === "income" ? "text-income" : "text-expense"
                            }`}
                          >
                            {tx.type === "income" ? "+" : "-"} {formatIDR(tx.amount)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <TransactionDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedTransaction(null);
        }}
        transaction={selectedTransaction}
        onEdit={(tx) => router.push(`/transactions/${tx.id}`)}
      />
    </div>
  );
}

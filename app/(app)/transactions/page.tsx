"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getIconComponent } from "@/lib/utils/icons";
import {
  ArrowRightLeft,
  Plus,
  Search,
  SlidersHorizontal,
  Calendar,
  X,
  FileImage,
  Edit2,
  Trash2,
  AlertCircle,
  Check,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  HelpCircle,
  Wallet as WalletIcon,
  Tag
} from "lucide-react";

interface Transaction {
  id: string;
  user_id: string;
  wallet_id: string;
  category_id: string | null;
  amount: number;
  type: "income" | "expense";
  description: string | null;
  transaction_date: string;
  receipt_url: string | null;
  created_at: string;
  wallets: {
    name: string;
    icon: string;
    color: string;
  } | null;
  categories: {
    name: string;
    icon: string;
    color: string;
  } | null;
}

interface Wallet {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
}

export default function TransactionsPage() {
  const supabase = createClient();

  // Load States
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<"all" | "income" | "expense">("all");
  const [selectedWalletId, setSelectedWalletId] = useState<string>("all");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${d.getFullYear()}-${m}`; // YYYY-MM
  });

  // UI States
  const [showFilters, setShowFilters] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [receiptModalUrl, setReceiptModalUrl] = useState<string | null>(null);

  // Messages
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Parallel fetching
      const [walletsRes, categoriesRes] = await Promise.all([
        supabase.from("wallets").select("id, name").order("name"),
        supabase.from("categories").select("id, name, type").order("name")
      ]);

      if (walletsRes.data) setWallets(walletsRes.data);
      if (categoriesRes.data) setCategories(categoriesRes.data);

      await fetchTransactions();
    }
    loadInitialData();
  }, [supabase]);

  // Refetch transactions when date filters change (or manual call)
  async function fetchTransactions() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from("transactions")
        .select(`
          *,
          wallets (name, icon, color),
          categories (name, icon, color)
        `)
        .eq("user_id", user.id);

      // Apply Month Filter if set
      if (selectedMonth) {
        const [year, month] = selectedMonth.split("-");
        const startDate = `${year}-${month}-01`;
        const endDate = new Date(parseInt(year), parseInt(month), 0)
          .toISOString()
          .split("T")[0];
        
        query = query.gte("transaction_date", startDate).lte("transaction_date", endDate);
      }

      query = query
        .order("transaction_date", { ascending: false })
        .order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      setTransactions(data || []);
    } catch (err: any) {
      console.error("Error fetching transactions:", err);
      setErrorMsg("Gagal mengambil data transaksi: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  // Handle month selection change
  useEffect(() => {
    fetchTransactions();
  }, [selectedMonth]);

  // Handle Delete Transaction
  async function handleDeleteTransaction() {
    if (!transactionToDelete) return;
    setDeletingId(transactionToDelete.id);
    setErrorMsg(null);

    try {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", transactionToDelete.id);

      if (error) throw error;

      setSuccessMsg("Transaksi berhasil dihapus.");
      setTransactions((prev) => prev.filter((t) => t.id !== transactionToDelete.id));
      setTransactionToDelete(null);
    } catch (err: any) {
      console.error("Error deleting transaction:", err);
      setErrorMsg("Gagal menghapus transaksi: " + err.message);
    } finally {
      setDeletingId(null);
    }
  }

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  const formatDateLong = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  // Filter client-side for search, wallet, category, and type
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.categories?.name.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesType = selectedType === "all" || t.type === selectedType;
    const matchesWallet = selectedWalletId === "all" || t.wallet_id === selectedWalletId;
    const matchesCategory = selectedCategoryId === "all" || t.category_id === selectedCategoryId;

    return matchesSearch && matchesType && matchesWallet && matchesCategory;
  });

  // Calculate stats for current month's filtered data
  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const netFlow = totalIncome - totalExpense;

  // Group transactions by date
  const groupedTransactions: { [date: string]: Transaction[] } = {};
  filteredTransactions.forEach((t) => {
    const date = t.transaction_date;
    if (!groupedTransactions[date]) {
      groupedTransactions[date] = [];
    }
    groupedTransactions[date].push(t);
  });

  const uniqueDates = Object.keys(groupedTransactions).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2">
            <ArrowRightLeft className="w-6 h-6 text-primary" />
            Daftar Transaksi
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Lihat, cari, filter, dan kelola semua catatan keuangan Anda.
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

      {/* Messages */}
      {errorMsg && (
        <div className="bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded-lg flex items-start gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span className="text-xs font-medium">{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-success/10 border border-success/20 text-success px-4 py-3 rounded-lg flex items-start gap-3 animate-fade-in">
          <Check className="w-5 h-5 shrink-0 mt-0.5" />
          <span className="text-xs font-medium">{successMsg}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Income Card */}
        <div className="bg-surface-card border border-border p-4 rounded-xl flex items-center gap-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-income" />
          <div className="w-10 h-10 rounded-lg bg-income/10 text-income flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xxs font-bold text-text-secondary uppercase tracking-wider">Total Pemasukan</p>
            <p className="text-lg font-bold font-mono text-income mt-0.5">{formatIDR(totalIncome)}</p>
          </div>
        </div>

        {/* Expense Card */}
        <div className="bg-surface-card border border-border p-4 rounded-xl flex items-center gap-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-expense" />
          <div className="w-10 h-10 rounded-lg bg-expense/10 text-expense flex items-center justify-center">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xxs font-bold text-text-secondary uppercase tracking-wider">Total Pengeluaran</p>
            <p className="text-lg font-bold font-mono text-expense mt-0.5">{formatIDR(totalExpense)}</p>
          </div>
        </div>

        {/* Net Flow Card */}
        <div className="bg-surface-card border border-border p-4 rounded-xl flex items-center gap-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-primary" />
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            netFlow >= 0 ? "bg-primary/10 text-primary" : "bg-danger/10 text-danger"
          }`}>
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xxs font-bold text-text-secondary uppercase tracking-wider">Arus Bersih (Net)</p>
            <p className={`text-lg font-bold font-mono mt-0.5 ${
              netFlow >= 0 ? "text-text-primary" : "text-danger"
            }`}>{formatIDR(netFlow)}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface-card border border-border rounded-xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari deskripsi atau kategori..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface-input border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-text-primary text-sm outline-none transition-all"
            />
          </div>

          {/* Month Selector */}
          <div className="relative w-full sm:w-48">
            <Calendar className="w-5 h-5 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface-input border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-text-primary text-sm outline-none transition-all cursor-pointer"
            />
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 border rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              showFilters
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:border-border-strong text-text-secondary hover:text-text-primary"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filter
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border/50 animate-fade-in">
            {/* Type Filter */}
            <div className="space-y-1.5">
              <label className="text-xxs font-bold text-text-secondary uppercase">Jenis Transaksi</label>
              <select
                value={selectedType}
                onChange={(e: any) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 bg-surface-input border border-border rounded-lg text-text-primary text-xs outline-none focus:border-primary cursor-pointer"
              >
                <option value="all">Semua Tipe</option>
                <option value="income">Pemasukan saja</option>
                <option value="expense">Pengeluaran saja</option>
              </select>
            </div>

            {/* Wallet Filter */}
            <div className="space-y-1.5">
              <label className="text-xxs font-bold text-text-secondary uppercase">Dompet</label>
              <select
                value={selectedWalletId}
                onChange={(e) => setSelectedWalletId(e.target.value)}
                className="w-full px-3 py-2 bg-surface-input border border-border rounded-lg text-text-primary text-xs outline-none focus:border-primary cursor-pointer"
              >
                <option value="all">Semua Dompet</option>
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div className="space-y-1.5">
              <label className="text-xxs font-bold text-text-secondary uppercase">Kategori</label>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="w-full px-3 py-2 bg-surface-input border border-border rounded-lg text-text-primary text-xs outline-none focus:border-primary cursor-pointer"
              >
                <option value="all">Semua Kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.type === "expense" ? "Pengeluaran" : "Pemasukan"})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Transactions List */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2].map((groupIndex) => (
            <div key={groupIndex} className="space-y-3">
              <div className="h-6 w-48 bg-surface-card rounded animate-pulse" />
              <div className="space-y-2">
                {[1, 2, 3].map((cardIndex) => (
                  <div key={cardIndex} className="h-16 bg-surface-card border border-border rounded-xl animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : uniqueDates.length > 0 ? (
        <div className="space-y-6">
          {uniqueDates.map((date) => {
            const dayTransactions = groupedTransactions[date];
            return (
              <div key={date} className="space-y-3">
                <h3 className="text-xs font-bold text-text-secondary tracking-wide uppercase px-1">
                  {formatDateLong(date)}
                </h3>

                <div className="space-y-2">
                  {dayTransactions.map((tx) => {
                    const CatIcon = tx.categories
                      ? getIconComponent(tx.categories.icon)
                      : HelpCircle;
                    
                    return (
                      <div
                        key={tx.id}
                        className="bg-surface-card border border-border hover:border-border-strong rounded-xl p-4 flex items-center justify-between shadow-sm hover:shadow transition-all group"
                      >
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          {/* Category Icon */}
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0"
                            style={{
                              backgroundColor: tx.categories?.color || "#6B7280"
                            }}
                          >
                            <CatIcon className="w-5 h-5" />
                          </div>

                          {/* Details */}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-text-primary truncate">
                              {tx.description || tx.categories?.name || "Tanpa Kategori"}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              {/* Wallet tag */}
                              <span className="inline-flex items-center gap-1 text-xxs font-medium text-text-secondary bg-surface-hover border border-border px-1.5 py-0.5 rounded">
                                <WalletIcon className="w-3 h-3" />
                                {tx.wallets?.name || "Dompet Terhapus"}
                              </span>
                              {/* Category Tag */}
                              {tx.categories && (
                                <span className="inline-flex items-center gap-1 text-xxs font-medium text-text-secondary bg-surface-hover border border-border px-1.5 py-0.5 rounded">
                                  <Tag className="w-3 h-3" />
                                  {tx.categories.name}
                                </span>
                              )}
                              {/* Receipt attached icon */}
                              {tx.receipt_url && (
                                <button
                                  onClick={() => setReceiptModalUrl(tx.receipt_url)}
                                  className="inline-flex items-center gap-1 text-xxs font-medium text-primary bg-primary/10 border border-primary/20 hover:bg-primary/20 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                                  title="Lihat Nota"
                                >
                                  <FileImage className="w-3 h-3" />
                                  Ada Nota
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Amount & Actions */}
                        <div className="flex items-center gap-4 ml-4 shrink-0">
                          <span className={`text-sm font-bold font-mono ${
                            tx.type === "income" ? "text-income" : "text-expense"
                          }`}>
                            {tx.type === "income" ? "+" : "-"} {formatIDR(tx.amount)}
                          </span>

                          <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                            <Link
                              href={`/transactions/${tx.id}`}
                              className="p-1.5 text-text-secondary hover:text-primary hover:bg-surface-hover rounded-md transition-colors cursor-pointer"
                              title="Sunting Transaksi"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => setTransactionToDelete(tx)}
                              className="p-1.5 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-md transition-colors cursor-pointer"
                              title="Hapus Transaksi"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-surface-card border border-border border-dashed rounded-xl p-12 text-center space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-surface-input text-text-secondary">
            <ArrowRightLeft className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-text-primary">
            Tidak ada transaksi
          </h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto">
            Tidak ditemukan transaksi untuk filter saat ini. Coba pilih bulan lain atau ubah filter pencarian Anda.
          </p>
        </div>
      )}

      {/* Delete Transaction Modal */}
      {transactionToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-surface-card border border-border rounded-xl max-w-sm w-full p-6 shadow-2xl space-y-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-danger/10 text-danger mb-2">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-text-primary">
                Hapus Transaksi?
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Apakah Anda yakin ingin menghapus transaksi <strong>{transactionToDelete.description || transactionToDelete.categories?.name || "Pemasukan/Pengeluaran"}</strong> sebesar <strong>{formatIDR(transactionToDelete.amount)}</strong>? Saldo dompet akan disesuaikan secara otomatis.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setTransactionToDelete(null)}
                className="flex-1 px-4 py-2.5 bg-surface-hover border border-border hover:border-border-strong text-text-secondary text-sm font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteTransaction}
                disabled={deletingId !== null}
                className="flex-1 px-4 py-2.5 bg-danger hover:bg-danger-hover disabled:bg-danger/50 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
              >
                {deletingId ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Image Modal */}
      {receiptModalUrl && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => setReceiptModalUrl(null)}
        >
          <div
            className="bg-surface-card border border-border rounded-xl max-w-2xl w-full p-4 shadow-2xl relative flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setReceiptModalUrl(null)}
              className="absolute -top-12 right-0 text-white/80 hover:text-white flex items-center gap-1 text-sm cursor-pointer"
            >
              <X className="w-5 h-5" /> Tutup
            </button>
            <div className="w-full max-h-[70vh] overflow-auto rounded-lg bg-black/40 flex items-center justify-center">
              <img
                src={receiptModalUrl}
                alt="Nota Transaksi"
                className="max-w-full max-h-[70vh] object-contain rounded"
              />
            </div>
            <p className="text-xs text-text-secondary">
              Nota Lampiran Transaksi
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

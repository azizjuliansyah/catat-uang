"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useApp } from "@/app/providers/AppProvider";
import { useToast } from "@/components/ui/molecules/Toast";
import { Modal } from "@/components/ui/organisms/Modal";
import { EmptyState } from "@/components/ui/organisms/EmptyState";
import { Button } from "@/components/ui/atoms/Button";
import { ArrowRightLeft, Plus, Trash2 } from "lucide-react";
import { TransactionsFilters } from "./components/TransactionsFilters";
import { TransactionsStats } from "./components/TransactionsStats";
import { TransactionListGroup } from "./components/TransactionListGroup";
import { TransactionsSkeleton } from "./components/TransactionsSkeleton";

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
  wallets: {
    name: string;
    icon: string;
    color: string;
  } | null;
  paylater_platforms: {
    name: string;
    color: string;
    icon: string;
  } | null;
  categories: {
    name: string;
    icon: string;
    color: string;
  } | null;
}

function getLocalDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDateRange(type: string, customStart?: string, customEnd?: string) {
  const today = new Date();
  const endDate = getLocalDateString(today);
  let startDate = "";

  if (type === "1week") {
    const d = new Date();
    d.setDate(today.getDate() - 7);
    startDate = getLocalDateString(d);
  } else if (type === "2weeks") {
    const d = new Date();
    d.setDate(today.getDate() - 14);
    startDate = getLocalDateString(d);
  } else if (type === "1month") {
    const d = new Date();
    d.setMonth(today.getMonth() - 1);
    startDate = getLocalDateString(d);
  } else if (type === "3months") {
    const d = new Date();
    d.setMonth(today.getMonth() - 3);
    startDate = getLocalDateString(d);
  } else if (type === "custom") {
    startDate = customStart || endDate;
    return { startDate, endDate: customEnd || endDate };
  }

  return { startDate, endDate };
}

export default function TransactionsPage() {
  const supabase = createClient();
  const router = useRouter();
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  const { user, wallets, categories, refreshWallets } = useApp();

  // Load States
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<"all" | "income" | "expense">("all");
  const [selectedWalletId, setSelectedWalletId] = useState<string>("all");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [dateRangeType, setDateRangeType] = useState<string>("1month");
  const [customStartDate, setCustomStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return getLocalDateString(d);
  });
  const [customEndDate, setCustomEndDate] = useState<string>(() => {
    return getLocalDateString(new Date());
  });

  // UI States
  const [showFilters, setShowFilters] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [receiptModalUrl, setReceiptModalUrl] = useState<string | null>(null);

  // Refetch transactions when user or date filters change
  async function fetchTransactions() {
    if (!user) return;
    setLoading(true);
    try {
      let query = supabase
        .from("transactions")
        .select(`
          *,
          wallets (name, icon, color),
          paylater_platforms (name, color),
          categories (name, icon, color)
        `)
        .eq("user_id", user.id);

      const { startDate, endDate } = getDateRange(dateRangeType, customStartDate, customEndDate);
      const startISO = new Date(`${startDate}T00:00:00`).toISOString();
      const endISO = new Date(`${endDate}T23:59:59.999`).toISOString();
      query = query.gte("transaction_date", startISO).lte("transaction_date", endISO);

      query = query
        .order("transaction_date", { ascending: false })
        .order("created_at", { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      setTransactions((data as unknown as Transaction[]) || []);
    } catch (err: unknown) {
      console.error("Error fetching transactions:", err);
      const message = err instanceof Error ? err.message : String(err);
      showErrorToast("Gagal mengambil data transaksi: " + message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchTransactions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, dateRangeType, customStartDate, customEndDate]);

  // Handle Delete Transaction
  async function handleDeleteTransaction() {
    if (!transactionToDelete) return;
    setDeletingId(transactionToDelete.id);

    try {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", transactionToDelete.id);

      if (error) throw error;

      showSuccessToast("Transaksi berhasil dihapus.");
      setTransactions((prev) => prev.filter((t) => t.id !== transactionToDelete.id));
      setTransactionToDelete(null);
      await refreshWallets();
    } catch (err: unknown) {
      console.error("Error deleting transaction:", err);
      const message = err instanceof Error ? err.message : String(err);
      showErrorToast("Gagal menghapus transaksi: " + message);
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

  // Filter client-side
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.categories?.name.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesType = selectedType === "all" || t.type === selectedType;
    
    // Support unified source filtering
    const matchesWallet =
      selectedWalletId === "all" ||
      (selectedWalletId.startsWith("wallet:") && t.wallet_id === selectedWalletId.replace("wallet:", "")) ||
      (selectedWalletId.startsWith("paylater:") && t.paylater_id === selectedWalletId.replace("paylater:", ""));

    const matchesCategory = selectedCategoryId === "all" || t.category_id === selectedCategoryId;

    return matchesSearch && matchesType && matchesWallet && matchesCategory;
  });

  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const netFlow = totalIncome - totalExpense;

  // Group transactions
  const groupedTransactions: { [date: string]: Transaction[] } = {};
  filteredTransactions.forEach((t) => {
    const d = new Date(t.transaction_date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const date = `${year}-${month}-${day}`;
    
    if (!groupedTransactions[date]) {
      groupedTransactions[date] = [];
    }
    groupedTransactions[date].push(t);
  });

  const uniqueDates = Object.keys(groupedTransactions).sort(
    (a, b) => b.localeCompare(a)
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2 font-display">
            <ArrowRightLeft className="w-6 h-6 text-primary" />
            Daftar Transaksi
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Lihat, cari, filter, dan kelola semua catatan keuangan Anda.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => router.push("/transactions/new")}
          className="self-stretch sm:self-auto"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Transaksi Baru
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <TransactionsFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        dateRangeType={dateRangeType}
        setDateRangeType={setDateRangeType}
        customStartDate={customStartDate}
        setCustomStartDate={setCustomStartDate}
        customEndDate={customEndDate}
        setCustomEndDate={setCustomEndDate}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        selectedWalletId={selectedWalletId}
        setSelectedWalletId={setSelectedWalletId}
        selectedCategoryId={selectedCategoryId}
        setSelectedCategoryId={setSelectedCategoryId}
        wallets={wallets}
        categories={categories}
      />

      {/* Summary Stats */}
      <TransactionsStats
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        netFlow={netFlow}
        formatIDR={formatIDR}
      />

      {/* Transactions List */}
      {loading ? (
        <TransactionsSkeleton />
      ) : uniqueDates.length > 0 ? (
        <TransactionListGroup
          uniqueDates={uniqueDates}
          groupedTransactions={groupedTransactions}
          formatDateLong={formatDateLong}
          formatIDR={formatIDR}
          setReceiptModalUrl={setReceiptModalUrl}
          setTransactionToDelete={setTransactionToDelete}
        />
      ) : (
        <EmptyState
          icon={ArrowRightLeft}
          title="Tidak ada transaksi"
          description="Tidak ditemukan transaksi untuk filter saat ini. Coba pilih rentang tanggal lain atau ubah filter pencarian Anda."
          className="w-full max-w-none"
        />
      )}

      {/* Delete Transaction Modal */}
      <Modal
        isOpen={transactionToDelete !== null}
        onClose={() => setTransactionToDelete(null)}
        title="Hapus Transaksi?"
        isDestructive
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setTransactionToDelete(null)} className="flex-1">
              Batal
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDeleteTransaction} isLoading={deletingId !== null} className="flex-1">
              Hapus
            </Button>
          </>
        }
      >
        <div className="space-y-5 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-danger/10 text-danger mb-2">
            <Trash2 className="w-6 h-6" />
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Apakah Anda yakin ingin menghapus transaksi <strong>{transactionToDelete?.description || transactionToDelete?.categories?.name || "Pemasukan/Pengeluaran"}</strong> sebesar <strong>{transactionToDelete ? formatIDR(transactionToDelete.amount) : ""}</strong>? Saldo dompet akan disesuaikan secara otomatis.
          </p>
        </div>
      </Modal>

      {/* Receipt Image Modal */}
      <Modal
        isOpen={receiptModalUrl !== null}
        onClose={() => setReceiptModalUrl(null)}
        title="Nota Lampiran Transaksi"
        className="sm:max-w-xl md:max-w-2xl"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-full max-h-[60vh] overflow-auto rounded-xl bg-black/40 flex items-center justify-center border border-border">
            <img src={receiptModalUrl || ""} alt="Nota Transaksi" className="max-w-full max-h-[60vh] object-contain rounded" />
          </div>
        </div>
      </Modal>
    </div>
  );
}

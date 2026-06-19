"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useApp } from "@/app/providers/AppProvider";
import { useToast } from "@/components/ui/molecules/Toast";
import { Button } from "@/components/ui/atoms/Button";
import { ActionButton } from "@/components/ui/atoms/ActionButton";
import {
  ArrowLeft,
  Calendar,
  Trash2,
  Edit2,
  History,
  FileText,
  ExternalLink,
  Plus,
  Receipt
} from "lucide-react";
import { formatDateTimeShort, formatDateTimeLong } from "@/lib/utils/date";
import { formatIDR } from "@/lib/utils/format";
import { getIconComponent } from "@/lib/utils/icons";
import { PaylaterPaymentModal } from "../components/PaylaterPaymentModal";
import { DeletePaylaterPaymentModal } from "../components/DeletePaylaterPaymentModal";

interface PaylaterPlatform {
  id: string;
  user_id: string;
  name: string;
  limit_amount: number;
  balance: number;
  billing_cycle_date: number;
  due_date_offset: number;
  icon: string;
  color: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

interface PaylaterTransaction {
  id: string;
  amount: number;
  type: "income" | "expense";
  description: string | null;
  transaction_date: string;
  receipt_url: string | null;
  categories: {
    id: string;
    name: string;
    icon: string;
    color: string;
  } | null;
}

interface PaylaterPayment {
  id: string;
  amount: number;
  payment_date: string;
  created_at: string;
  transaction_id?: string | null;
  wallets: {
    id: string;
    name: string;
  } | null;
}

export default function PaylaterDetailPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { user, loadingUser, wallets, refreshWallets, refreshPaylaterPlatforms } = useApp();
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  const [platform, setPlatform] = useState<PaylaterPlatform | null>(null);
  const [transactions, setTransactions] = useState<PaylaterTransaction[]>([]);
  const [payments, setPayments] = useState<PaylaterPayment[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<PaylaterPayment | null>(null);
  const [selectedTransactionIds, setSelectedTransactionIds] = useState<Set<string>>(new Set());

  // Fetch data
  const loadData = useCallback(async () => {
    if (!id || !user) return;
    setLoading(true);
    try {
      // Fetch platform details
      const { data: platformData, error: platformError } = await supabase
        .from("paylater_platforms")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (platformError || !platformData) {
        showErrorToast("Platform Paylater tidak ditemukan.");
        router.push("/paylater");
        return;
      }

      setPlatform(platformData);

      // Fetch transactions using this paylater (only expense transactions that add to balance)
      const { data: transactionsData, error: transactionsError } = await supabase
        .from("transactions")
        .select("id, amount, type, description, transaction_date, receipt_url, categories(id, name, icon, color)")
        .eq("paylater_id", id)
        .eq("type", "expense")
        .order("transaction_date", { ascending: false });

      if (transactionsError) throw transactionsError;
      setTransactions((transactionsData as unknown as PaylaterTransaction[]) || []);

      // Fetch payment history
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("paylater_payments")
        .select("id, amount, payment_date, created_at, transaction_id, wallets(id, name)")
        .eq("paylater_id", id)
        .order("payment_date", { ascending: false })
        .order("created_at", { ascending: false });

      if (paymentsError) throw paymentsError;
      setPayments((paymentsData as unknown as PaylaterPayment[]) || []);

    } catch (err: unknown) {
      console.error(err);
      showErrorToast("Gagal memuat data detail.");
    } finally {
      setLoading(false);
    }
  }, [id, user, supabase, router, showErrorToast]);

  useEffect(() => {
    if (!loadingUser) {
      if (!user) {
        router.push("/login");
      } else {
        loadData();
      }
    }
  }, [user, loadingUser, loadData, router]);

  // Handle payment success
  const handlePaymentSuccess = async () => {
    setSelectedTransactionIds(new Set());
    await loadData();
    await refreshWallets();
    await refreshPaylaterPlatforms();
  };

  // Handle delete payment
  const handleDeletePayment = async () => {
    if (!paymentToDelete) return;
    try {
      const txId = paymentToDelete.transaction_id;

      const { error: deletePaymentError } = await supabase
        .from("paylater_payments")
        .delete()
        .eq("id", paymentToDelete.id);

      if (deletePaymentError) throw deletePaymentError;

      if (txId) {
        const { error: deleteTxError } = await supabase
          .from("transactions")
          .delete()
          .eq("id", txId);
        if (deleteTxError) throw deleteTxError;
      }

      showSuccessToast("Pembayaran berhasil dihapus");
      setPaymentToDelete(null);
      await loadData();
      await refreshWallets();
      await refreshPaylaterPlatforms();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      showErrorToast("Gagal menghapus pembayaran: " + message);
    }
  };

  // Toggle transaction selection
  const toggleTransactionSelection = (transactionId: string) => {
    setSelectedTransactionIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(transactionId)) {
        newSet.delete(transactionId);
      } else {
        newSet.add(transactionId);
      }
      return newSet;
    });
  };

  // Select all unpaid transactions
  const selectAllTransactions = () => {
    const allIds = new Set(transactions.map(t => t.id));
    setSelectedTransactionIds(allIds);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedTransactionIds(new Set());
  };

  // Calculate total selected amount
  const selectedTotal = transactions
    .filter(t => selectedTransactionIds.has(t.id))
    .reduce((sum, t) => sum + t.amount, 0);

  if (loading || !platform) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-text-secondary">Memuat detail paylater...</p>
      </div>
    );
  }

  const IconComponent = getIconComponent(platform.icon);
  const remainingLimit = platform.limit_amount - platform.balance;
  const usagePercentage = platform.limit_amount > 0
    ? Math.min((platform.balance / platform.limit_amount) * 100, 100)
    : 0;

  // Calculate next billing date
  const getNextBillingDate = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const billingDay = platform.billing_cycle_date;

    let thisMonthBilling = new Date(currentYear, currentMonth, billingDay);
    if (thisMonthBilling < today) {
      thisMonthBilling = new Date(currentYear, currentMonth + 1, billingDay);
    }

    const dueDate = new Date(thisMonthBilling);
    dueDate.setDate(dueDate.getDate() + platform.due_date_offset);

    return {
      billing: formatDateTimeLong(thisMonthBilling.toISOString()),
      due: formatDateTimeLong(dueDate.toISOString())
    };
  };

  const nextDates = getNextBillingDate();

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Navigation and Top Toolbar */}
      <div className="flex flex-row justify-between">
        <Link
          href="/paylater"
          className="inline-flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Link>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/paylater")}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-xs cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit Platform
          </Button>
        </div>
      </div>

      {/* Platform Identity Card */}
      <div className="bg-surface-card border border-border rounded-2xl p-5 flex items-center justify-between gap-4 relative overflow-hidden">
        <div
          className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
          style={{ backgroundColor: platform.color }}
        />
        <div className="flex items-center gap-4 mt-1">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md shrink-0"
            style={{ backgroundColor: platform.color }}
          >
            <IconComponent className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary tracking-tight">{platform.name}</h1>
            {platform.is_archived && (
              <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-surface-hover text-text-secondary border border-border rounded-md mt-0.5 uppercase tracking-wider">
                Diarsipkan
              </span>
            )}
          </div>
        </div>
        <div className="text-right shrink-0 mt-1">
          <p className="text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">Siklus Tagihan</p>
          <p className="text-sm font-bold text-text-primary mt-1">Tgl {platform.billing_cycle_date}</p>
          <p className="text-[10px] text-text-secondary mt-0.5">+{platform.due_date_offset} hari jatuh tempo</p>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Sisa Tagihan — spans 2 cols */}
        <div className="col-span-2 bg-surface-card border border-border rounded-2xl p-5 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{ backgroundColor: platform.color }}
          />
          <p className="text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">Sisa Tagihan</p>
          <p className="text-2xl font-extrabold text-text-primary mt-2 font-mono">
            {formatIDR(platform.balance)}
          </p>
          <p className="text-[10px] text-text-secondary mt-1.5 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Jatuh tempo: {nextDates.due}
          </p>
        </div>

        {/* Total Limit */}
        <div className="bg-surface-card border border-border rounded-2xl p-5">
          <p className="text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">Total Limit</p>
          <p className="text-xl font-bold text-text-primary mt-2 font-mono">{formatIDR(platform.limit_amount)}</p>
        </div>

        {/* Sisa Limit */}
        <div className="bg-surface-card border border-border rounded-2xl p-5">
          <p className="text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">Sisa Limit</p>
          <p className="text-xl font-bold text-success mt-2 font-mono">{formatIDR(remainingLimit)}</p>
        </div>
      </div>

      {/* Progress Bar Card */}
      <div className="bg-surface-card border border-border rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-extrabold text-text-secondary uppercase tracking-wider">Penggunaan Limit</p>
          <span
            className="text-sm font-bold tabular-nums"
            style={{ color: platform.balance > platform.limit_amount ? "#EF4444" : platform.color }}
          >
            {usagePercentage.toFixed(1)}%
          </span>
        </div>
        <div className="w-full h-3 bg-surface-hover rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(usagePercentage, 100)}%`,
              backgroundColor: platform.balance > platform.limit_amount ? "#EF4444" : platform.color
            }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-text-secondary font-mono">
          <span>Terpakai: {formatIDR(platform.balance)}</span>
          <span>Limit: {formatIDR(platform.limit_amount)}</span>
        </div>
      </div>

      {/* Transaction History with Multi-Select Payment */}
      <div className="bg-surface-card border border-border rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-extrabold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              Riwayat Transaksi
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">Pilih transaksi untuk dibayar</p>
          </div>

          <div className="flex items-center gap-2">
            {selectedTransactionIds.size > 0 && (
              <>
                <span className="text-xs text-text-secondary font-mono">
                  {formatIDR(selectedTotal)}
                </span>
                <Button
                  onClick={() => setIsPaymentModalOpen(true)}
                  size="sm"
                  variant="primary"
                  className="text-xs"
                >
                  <Receipt className="w-3.5 h-3.5 mr-1" />
                  Bayar ({selectedTransactionIds.size})
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Bulk Actions */}
        {transactions.length > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={selectAllTransactions}
              className="text-primary hover:underline"
            >
              Pilih Semua
            </button>
            <span className="text-text-muted">•</span>
            <button
              onClick={clearSelection}
              className="text-text-secondary hover:text-text-primary"
            >
              Batal Pilih
            </button>
          </div>
        )}

        {/* Transaction List */}
        <div className="space-y-2">
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-xs text-text-secondary border border-dashed border-border rounded-xl">
              Belum ada transaksi menggunakan {platform.name}.
            </div>
          ) : (
            transactions.map((txn) => {
              const CategoryIcon = txn.categories ? getIconComponent(txn.categories.icon) : null;
              const isSelected = selectedTransactionIds.has(txn.id);

              return (
                <label
                  key={txn.id}
                  className={
                    "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all " +
                    (isSelected
                      ? "bg-primary/10 border-primary/30"
                      : "bg-surface/30 border-border hover:border-border-strong"
                    )
                  }
                >
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleTransactionSelection(txn.id)}
                    className="w-4 h-4 rounded border-border bg-surface-input text-primary focus:ring-primary focus:ring-2 cursor-pointer"
                  />

                  {CategoryIcon && txn.categories && (
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: txn.categories.color + "20" }}
                    >
                      <CategoryIcon className="w-4 h-4" style={{ color: txn.categories.color }} />
                    </div>
                  )}

                  {/* Transaction Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-text-primary truncate">
                        {txn.description || txn.categories?.name || "Transaksi"}
                      </span>
                      <span className="text-sm font-bold text-expense font-mono shrink-0">
                        {formatIDR(txn.amount)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-text-secondary mt-0.5">
                      <span>{formatDateTimeShort(txn.transaction_date)}</span>
                      {txn.receipt_url && (
                        <a
                          href={txn.receipt_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-0.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="w-3 h-3" />
                          Bukti
                        </a>
                      )}
                    </div>
                  </div>
                </label>
              );
            })
          )}
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-surface-card border border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-extrabold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-4 h-4" />
              Riwayat Pembayaran
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">Catatan pelunasan tagihan</p>
          </div>

          {platform.balance > 0 && (
            <Button
              onClick={() => setIsPaymentModalOpen(true)}
              size="sm"
              variant="primary"
              className="text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Bayar Tagihan
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {payments.length === 0 ? (
            <div className="text-center py-8 text-xs text-text-secondary border border-dashed border-border rounded-xl">
              Belum ada pembayaran dicatat.
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between py-3">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-text-primary font-mono">{formatIDR(payment.amount)}</p>
                    <p className="text-[10px] text-text-secondary">
                      Menggunakan {payment.wallets?.name || "Dompet Terhapus"} • {formatDateTimeShort(payment.payment_date)}
                    </p>
                  </div>

                  <ActionButton
                    icon={Trash2}
                    title="Hapus Pembayaran"
                    variant="danger"
                    onClick={() => setPaymentToDelete(payment)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <PaylaterPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedTransactionIds(new Set());
        }}
        platform={platform}
        selectedTransactionIds={selectedTransactionIds}
        transactions={transactions}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <DeletePaylaterPaymentModal
        isOpen={paymentToDelete !== null}
        onClose={() => setPaymentToDelete(null)}
        paymentToDelete={paymentToDelete}
        onConfirm={handleDeletePayment}
      />
    </div>
  );
}

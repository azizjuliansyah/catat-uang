"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useApp } from "@/app/providers/AppProvider";
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  Check, 
  AlertCircle, 
  Info,
  Calendar,
  User,
  X,
  TrendingDown,
  TrendingUp,
  Receipt,
  History,
  Coins
} from "lucide-react";

interface DebtItem {
  id: string;
  user_id: string;
  name: string;
  total_amount: number;
  paid_amount: number;
  due_date: string;
  status: "unpaid" | "paid";
  type: "owe" | "lend";
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface WalletItem {
  id: string;
  name: string;
  balance: number;
}

interface DebtPaymentItem {
  id: string;
  debt_id: string;
  wallet_id: string;
  amount: number;
  payment_date: string;
  created_at: string;
  wallets: {
    name: string;
  } | null;
}

export default function DebtsPage() {
  const supabase = createClient();
  const { user, loadingUser, wallets, loadingWallets, refreshWallets } = useApp();
  
  // Data States
  const [debts, setDebts] = useState<DebtItem[]>([]);
  const [loadingDebts, setLoadingDebts] = useState(true);
  const loading = loadingUser || loadingWallets || loadingDebts;
  const [activeTab, setActiveTab] = useState<"owe" | "lend">("owe");
  const [subTab, setSubTab] = useState<"active" | "settled">("active");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Messages
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modals States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [debtToDelete, setDebtToDelete] = useState<DebtItem | null>(null);
  const [paymentToDelete, setPaymentToDelete] = useState<DebtPaymentItem | null>(null);

  // Form States - Add/Edit Debt
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<"owe" | "lend">("owe");
  const [formTotalAmount, setFormTotalAmount] = useState("");
  const [formDueDate, setFormDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  });
  const [formDescription, setFormDescription] = useState("");
  const [editingDebt, setEditingDebt] = useState<DebtItem | null>(null);
  const [submittingDebt, setSubmittingDebt] = useState(false);

  // Form States - Pay Debt
  const [payingDebt, setPayingDebt] = useState<DebtItem | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payWalletId, setPayWalletId] = useState("");
  const [payDate, setPayDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // History States
  const [selectedDebtForHistory, setSelectedDebtForHistory] = useState<DebtItem | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<DebtPaymentItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Fetch all debts
  async function fetchDebts() {
    try {
      setLoadingDebts(true);
      setErrorMsg(null);
      const { data, error } = await supabase
        .from("debts")
        .select("*")
        .order("due_date", { ascending: true });

      if (error) throw error;
      setDebts(data || []);
    } catch (err: any) {
      console.error("Error fetching debts:", err);
      showToast("Gagal memuat daftar hutang/piutang: " + err.message, false);
    } finally {
      setLoadingDebts(false);
    }
  }

  // Init Data and select default wallet
  useEffect(() => {
    if (!loadingUser && user) {
      fetchDebts();
    }
  }, [user, loadingUser]);

  useEffect(() => {
    if (wallets.length > 0 && !payWalletId) {
      const activeWallets = wallets.filter(w => !w.is_archived);
      if (activeWallets.length > 0) {
        setPayWalletId(activeWallets[0].id);
      }
    }
  }, [wallets, payWalletId]);

  // Toast Helpers
  const showToast = (message: string, isSuccess = true) => {
    if (isSuccess) {
      setSuccessMsg(message);
      setTimeout(() => setSuccessMsg(null), 3000);
    } else {
      setErrorMsg(message);
      setTimeout(() => setErrorMsg(null), 4000);
    }
  };

  // 1. ADD / EDIT DEBT SUBMIT
  const handleSaveDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast("Nama kontak tidak boleh kosong", false);
      return;
    }
    const amountNum = parseFloat(formTotalAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      showToast("Jumlah dana harus lebih besar dari 0", false);
      return;
    }
    if (!user) return;

    try {
      setSubmittingDebt(true);
      if (editingDebt) {
        // Update
        const { error } = await supabase
          .from("debts")
          .update({
            name: formName.trim(),
            type: formType,
            total_amount: amountNum,
            due_date: formDueDate,
            description: formDescription.trim() || null
          })
          .eq("id", editingDebt.id);

        if (error) throw error;
        showToast("Data hutang/piutang berhasil diperbarui!");
        setIsEditModalOpen(false);
      } else {
        // Insert new
        const { error } = await supabase
          .from("debts")
          .insert([{
            user_id: user.id,
            name: formName.trim(),
            type: formType,
            total_amount: amountNum,
            due_date: formDueDate,
            description: formDescription.trim() || null,
            paid_amount: 0.00,
            status: "unpaid"
          }]);

        if (error) throw error;
        showToast("Hutang/piutang baru berhasil ditambahkan!");
        setIsAddModalOpen(false);
      }

      // Reset
      resetDebtForm();
      await fetchDebts();
    } catch (err: any) {
      console.error(err);
      showToast("Gagal menyimpan data: " + err.message, false);
    } finally {
      setSubmittingDebt(false);
    }
  };

  const resetDebtForm = () => {
    setFormName("");
    setFormType("owe");
    setFormTotalAmount("");
    const d = new Date();
    d.setDate(d.getDate() + 30);
    setFormDueDate(d.toISOString().split("T")[0]);
    setFormDescription("");
    setEditingDebt(null);
  };

  const openEditModal = (item: DebtItem) => {
    setEditingDebt(item);
    setFormName(item.name);
    setFormType(item.type);
    setFormTotalAmount(item.total_amount.toString());
    setFormDueDate(item.due_date);
    setFormDescription(item.description || "");
    setIsEditModalOpen(true);
  };

  // 2. DELETE DEBT
  const handleDeleteDebt = async () => {
    if (!debtToDelete) return;
    try {
      const { error } = await supabase
        .from("debts")
        .delete()
        .eq("id", debtToDelete.id);

      if (error) throw error;
      showToast("Data hutang/piutang berhasil dihapus");
      setDebtToDelete(null);
      await fetchDebts();
    } catch (err: any) {
      console.error(err);
      showToast("Gagal menghapus data: " + err.message, false);
    }
  };

  // 3. RECORD PAYMENT SUBMIT
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingDebt) return;
    const amountNum = parseFloat(payAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      showToast("Jumlah pembayaran harus lebih besar dari 0", false);
      return;
    }
    if (!payWalletId) {
      showToast("Silakan pilih dompet transaksi", false);
      return;
    }

    const remaining = payingDebt.total_amount - payingDebt.paid_amount;
    if (amountNum > remaining + 0.01) {
      showToast(`Jumlah pembayaran melebihi sisa tagihan (${formatIDR(remaining)})`, false);
      return;
    }

    try {
      setSubmittingPayment(true);
      const { error } = await supabase
        .from("debt_payments")
        .insert([{
          debt_id: payingDebt.id,
          wallet_id: payWalletId,
          amount: amountNum,
          payment_date: payDate
        }]);

      if (error) throw error;
      showToast("Pembayaran berhasil dicatat!");
      setIsPayModalOpen(false);
      
      // Reset Form
      setPayAmount("");
      setPayingDebt(null);

      // Refresh Data
      await fetchDebts();
      await refreshWallets();
    } catch (err: any) {
      console.error(err);
      showToast("Gagal mencatat pembayaran: " + err.message, false);
    } finally {
      setSubmittingPayment(false);
    }
  };

  const openPayModal = (item: DebtItem) => {
    setPayingDebt(item);
    const remaining = item.total_amount - item.paid_amount;
    setPayAmount(remaining.toString());
    setIsPayModalOpen(true);
  };

  // 4. FETCH AND VIEW HISTORY
  async function fetchHistory(debtId: string) {
    try {
      setLoadingHistory(true);
      const { data, error } = await supabase
        .from("debt_payments")
        .select(`
          *,
          wallets (name)
        `)
        .eq("debt_id", debtId)
        .order("payment_date", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPaymentHistory(data || []);
    } catch (err: any) {
      console.error(err);
      showToast("Gagal mengambil riwayat pembayaran: " + err.message, false);
    } finally {
      setLoadingHistory(false);
    }
  }

  const openHistoryModal = async (item: DebtItem) => {
    setSelectedDebtForHistory(item);
    setIsHistoryModalOpen(true);
    await fetchHistory(item.id);
  };

  // 5. DELETE PAYMENT
  const handleDeletePayment = async () => {
    if (!paymentToDelete || !selectedDebtForHistory) return;
    try {
      const { error } = await supabase
        .from("debt_payments")
        .delete()
        .eq("id", paymentToDelete.id);

      if (error) throw error;
      showToast("Pembayaran berhasil dihapus dari riwayat");
      setPaymentToDelete(null);

      // Refresh
      await fetchHistory(selectedDebtForHistory.id);
      await fetchDebts();
      await refreshWallets();
    } catch (err: any) {
      console.error(err);
      showToast("Gagal menghapus pembayaran: " + err.message, false);
    }
  };

  // Data Filtering
  const filteredDebts = debts.filter((item) => {
    const matchesTab = item.type === activeTab;
    const matchesSubTab = subTab === "active" ? item.status === "unpaid" : item.status === "paid";
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesTab && matchesSubTab && matchesSearch;
  });

  // Calculations for Summary Cards
  const totalDebtAmount = debts
    .filter(d => d.type === "owe" && d.status === "unpaid")
    .reduce((sum, d) => sum + (d.total_amount - d.paid_amount), 0);

  const totalLendAmount = debts
    .filter(d => d.type === "lend" && d.status === "unpaid")
    .reduce((sum, d) => sum + (d.total_amount - d.paid_amount), 0);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  const isOverdue = (dateStr: string) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const dueDate = new Date(dateStr);
    dueDate.setHours(0,0,0,0);
    return dueDate < today;
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {successMsg && (
        <div className="fixed top-4 right-4 z-50 bg-success/15 border border-success/30 text-success px-4 py-3 rounded-xl flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-top-4 duration-200">
          <Check className="w-4 h-4 shrink-0" />
          <span className="text-sm font-semibold">{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="fixed top-4 right-4 z-50 bg-danger/15 border border-danger/30 text-danger px-4 py-3 rounded-xl flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-top-4 duration-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="text-sm font-semibold">{errorMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Kelola Hutang & Piutang</h1>
          <p className="text-sm text-text-secondary mt-0.5">Catat dan lacak pembayaran hutang piutang Anda dengan mudah.</p>
        </div>
        <button
          onClick={() => {
            resetDebtForm();
            setFormType(activeTab);
            setIsAddModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-medium transition-colors hover:shadow-lg hover:shadow-primary/10 cursor-pointer w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Tambah Catatan
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface-card border border-border rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-debt-owe/5 rounded-full blur-2xl pointer-events-none group-hover:bg-debt-owe/10 transition-all" />
          <div className="w-12 h-12 rounded-xl bg-debt-owe/10 text-debt-owe flex items-center justify-center shrink-0">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-text-secondary">Sisa Hutang Saya (Owe)</p>
            <p className="text-2xl font-bold text-text-primary font-mono mt-1">{formatIDR(totalDebtAmount)}</p>
          </div>
        </div>

        <div className="bg-surface-card border border-border rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-debt-lend/5 rounded-full blur-2xl pointer-events-none group-hover:bg-debt-lend/10 transition-all" />
          <div className="w-12 h-12 rounded-xl bg-debt-lend/10 text-debt-lend flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-text-secondary">Sisa Piutang Saya (Lend)</p>
            <p className="text-2xl font-bold text-text-primary font-mono mt-1">{formatIDR(totalLendAmount)}</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        {/* Main Tab Owe / Lend */}
        <div className="bg-surface-input p-1 rounded-xl flex gap-1 self-start">
          <button
            onClick={() => {
              setActiveTab("owe");
              setSearchTerm("");
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === "owe" 
                ? "bg-surface-card text-text-primary shadow-sm border border-border" 
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Hutang Saya
          </button>
          <button
            onClick={() => {
              setActiveTab("lend");
              setSearchTerm("");
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === "lend" 
                ? "bg-surface-card text-text-primary shadow-sm border border-border" 
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Piutang Saya
          </button>
        </div>

        {/* Search & SubTab */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {/* SubTab Active / Settled */}
          <div className="border border-border rounded-xl p-0.5 flex gap-1 bg-surface-card">
            <button
              onClick={() => setSubTab("active")}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                subTab === "active" ? "bg-surface-input text-text-primary" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Aktif
            </button>
            <button
              onClick={() => setSubTab("settled")}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                subTab === "settled" ? "bg-surface-input text-text-primary" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Lunas
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari kontak atau catatan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface-input border border-border focus:border-primary focus:outline-none rounded-xl text-xs text-text-primary font-medium"
            />
          </div>
        </div>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-44 bg-surface-card border border-border rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredDebts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 border border-dashed border-border rounded-2xl text-center">
          <div className="w-12 h-12 rounded-full bg-surface-hover flex items-center justify-center text-text-muted mb-3">
            <Receipt className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-text-primary">Tidak ada catatan ditemukan</h3>
          <p className="text-sm text-text-secondary mt-1 max-w-sm">
            {searchTerm 
              ? "Coba ganti kata kunci pencarian Anda." 
              : `Belum ada catatan ${activeTab === "owe" ? "hutang" : "piutang"} ${subTab === "active" ? "aktif" : "lunas"} Anda.`}
          </p>
          {!searchTerm && subTab === "active" && (
            <button
              onClick={() => {
                resetDebtForm();
                setFormType(activeTab);
                setIsAddModalOpen(true);
              }}
              className="mt-4 inline-flex items-center gap-1 text-sm text-primary font-semibold hover:underline"
            >
              Tambah catatan baru →
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDebts.map((item) => {
            const remaining = item.total_amount - item.paid_amount;
            const progress = (item.paid_amount / item.total_amount) * 100;
            const isLate = item.status === "unpaid" && isOverdue(item.due_date);

            return (
              <div 
                key={item.id}
                className="bg-surface-card border border-border hover:border-border-strong rounded-2xl p-5 flex flex-col justify-between transition-all shadow-sm hover:shadow-md relative overflow-hidden group"
              >
                {/* Visual Accent bar depending on owe or lend */}
                <div 
                  className={`absolute left-0 top-0 bottom-0 w-1.5 ${item.type === "owe" ? "bg-debt-owe" : "bg-debt-lend"}`}
                />

                {/* Top Info */}
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        item.type === "owe" ? "bg-debt-owe/10 text-debt-owe" : "bg-debt-lend/10 text-debt-lend"
                      }`}>
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-text-primary group-hover:text-primary transition-colors text-sm sm:text-base leading-tight">
                          {item.name}
                        </h3>
                        <span className="text-xxs text-text-secondary">
                          Catatan {item.type === "owe" ? "Hutang" : "Piutang"}
                        </span>
                      </div>
                    </div>

                    {/* Actions dropdown/buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(item)}
                        title="Edit Catatan"
                        className="p-1.5 text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface-hover transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDebtToDelete(item)}
                        title="Hapus Catatan"
                        className="p-1.5 text-text-secondary hover:text-danger rounded-lg hover:bg-danger/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Description if any */}
                  {item.description && (
                    <p className="text-xs text-text-secondary mt-3 line-clamp-2 bg-surface/30 p-2 rounded-lg border border-border/40">
                      {item.description}
                    </p>
                  )}

                  {/* Amounts */}
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-text-muted">Total Tagihan</p>
                      <p className="font-semibold text-text-primary font-mono mt-0.5">{formatIDR(item.total_amount)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-text-muted">Sisa Tagihan</p>
                      <p className={`font-semibold font-mono mt-0.5 ${item.status === "paid" ? "text-success" : "text-text-primary"}`}>
                        {item.status === "paid" ? "Lunas" : formatIDR(remaining)}
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="w-full h-1.5 bg-surface-input rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.status === "paid" 
                            ? "bg-success" 
                            : item.type === "owe" ? "bg-debt-owe" : "bg-debt-lend"
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-xxs text-text-secondary mt-1 font-mono">
                      <span>Terbayar: {formatIDR(item.paid_amount)}</span>
                      <span>{progress.toFixed(0)}%</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-xxs text-text-secondary">
                    <Calendar className="w-3 h-3 text-text-muted" />
                    <span>Tempo: </span>
                    <span className={`font-semibold ${isLate ? "text-danger" : "text-text-primary"}`}>
                      {new Date(item.due_date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </span>
                    {isLate && (
                      <span className="ml-1.5 px-1 py-0.5 bg-danger/10 text-danger border border-danger/20 rounded font-semibold text-xxxxs">
                        TERLEWAT
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openHistoryModal(item)}
                      title="Lihat Riwayat Pembayaran"
                      className="px-2.5 py-1.5 bg-surface-input hover:bg-surface-hover border border-border text-text-primary rounded-lg text-xxs font-medium flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <History className="w-3 h-3" />
                      Riwayat
                    </button>
                    {item.status === "unpaid" && (
                      <button
                        onClick={() => openPayModal(item)}
                        className={`px-3 py-1.5 text-white rounded-lg text-xxs font-semibold flex items-center gap-1 transition-all cursor-pointer hover:shadow-md ${
                          item.type === "owe" 
                            ? "bg-debt-owe hover:bg-debt-owe/90 shadow-debt-owe/5" 
                            : "bg-debt-lend hover:bg-debt-lend/90 shadow-debt-lend/5"
                        }`}
                      >
                        <Coins className="w-3 h-3" />
                        Bayar Cicil
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT DEBT ================= */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-card border border-border rounded-2xl w-full max-w-md shadow-2xl p-6 relative animate-in scale-in duration-200">
            <button
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
              }}
              className="absolute top-4 right-4 text-text-secondary hover:text-text-primary cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-text-primary mb-4">
              {isEditModalOpen ? "Edit Catatan Hutang/Piutang" : "Tambah Catatan Baru"}
            </h2>

            <form onSubmit={handleSaveDebt} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Jenis Catatan <span className="text-danger">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2 bg-surface-input p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setFormType("owe")}
                    className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      formType === "owe" 
                        ? "bg-debt-owe text-white font-bold" 
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    Hutang Saya (Owe)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType("lend")}
                    className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      formType === "lend" 
                        ? "bg-debt-lend text-white font-bold" 
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    Piutang Saya (Lend)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Nama Kontak <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi, Bank Mandiri, Sisca"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-surface-input border border-border focus:border-primary focus:outline-none rounded-xl text-sm text-text-primary font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Jumlah Dana (Rp) <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  placeholder="0"
                  value={formTotalAmount}
                  onChange={(e) => setFormTotalAmount(e.target.value)}
                  className="w-full px-3.5 py-2 bg-surface-input border border-border focus:border-primary focus:outline-none rounded-xl text-sm text-text-primary font-mono font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Tanggal Jatuh Tempo <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formDueDate}
                  onChange={(e) => setFormDueDate(e.target.value)}
                  className="w-full px-3.5 py-2 bg-surface-input border border-border focus:border-primary focus:outline-none rounded-xl text-sm text-text-primary font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Catatan Tambahan
                </label>
                <textarea
                  placeholder="Masukkan keterangan detail jika ada..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2 bg-surface-input border border-border focus:border-primary focus:outline-none rounded-xl text-sm text-text-primary font-medium resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="flex-1 px-4 py-2.5 bg-surface-input hover:bg-surface-hover border border-border text-text-primary rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingDebt}
                  className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors hover:shadow-lg hover:shadow-primary/10 cursor-pointer"
                >
                  {submittingDebt ? "Menyimpan..." : "Simpan Catatan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: RECORD PAYMENT ================= */}
      {isPayModalOpen && payingDebt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-card border border-border rounded-2xl w-full max-w-sm shadow-2xl p-6 relative animate-in scale-in duration-200">
            <button
              onClick={() => {
                setIsPayModalOpen(false);
                setPayingDebt(null);
              }}
              className="absolute top-4 right-4 text-text-secondary hover:text-text-primary cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-text-primary mb-1">
              Catat Pembayaran
            </h2>
            <p className="text-xs text-text-secondary mb-4">
              Membayar cicilan / pelunasan ke <span className="font-semibold text-text-primary">{payingDebt.name}</span>.
            </p>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Sumber / Tujuan Dompet <span className="text-danger">*</span>
                </label>
                <select
                  required
                  value={payWalletId}
                  onChange={(e) => setPayWalletId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-input border border-border focus:border-primary focus:outline-none rounded-xl text-sm text-text-primary font-medium"
                >
                  <option value="" disabled>Pilih Dompet</option>
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({formatIDR(w.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Jumlah Pembayaran (Rp) <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  max={(payingDebt.total_amount - payingDebt.paid_amount + 0.01).toString()}
                  placeholder="0"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-3.5 py-2 bg-surface-input border border-border focus:border-primary focus:outline-none rounded-xl text-sm text-text-primary font-mono font-medium"
                />
                <span className="text-xxxxs text-text-muted mt-1 block">
                  Sisa Tagihan: {formatIDR(payingDebt.total_amount - payingDebt.paid_amount)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Tanggal Transaksi <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                  className="w-full px-3.5 py-2 bg-surface-input border border-border focus:border-primary focus:outline-none rounded-xl text-sm text-text-primary font-medium"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsPayModalOpen(false);
                    setPayingDebt(null);
                  }}
                  className="flex-1 px-4 py-2.5 bg-surface-input hover:bg-surface-hover border border-border text-text-primary rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingPayment}
                  className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors hover:shadow-lg hover:shadow-primary/10 cursor-pointer"
                >
                  {submittingPayment ? "Memproses..." : "Bayar Sekarang"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: PAYMENT HISTORY ================= */}
      {isHistoryModalOpen && selectedDebtForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-card border border-border rounded-2xl w-full max-w-lg shadow-2xl p-6 relative animate-in scale-in duration-200 flex flex-col max-h-[85vh]">
            <button
              onClick={() => {
                setIsHistoryModalOpen(false);
                setSelectedDebtForHistory(null);
                setPaymentHistory([]);
              }}
              className="absolute top-4 right-4 text-text-secondary hover:text-text-primary cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-text-primary mb-1">
              Riwayat Pembayaran
            </h2>
            <p className="text-xs text-text-secondary mb-4">
              Pembayaran cicilan untuk kontak <span className="font-semibold text-text-primary">{selectedDebtForHistory.name}</span>
            </p>

            <div className="flex-1 overflow-y-auto pr-1 space-y-3 min-h-[200px]">
              {loadingHistory ? (
                <div className="space-y-2 py-4">
                  {[1, 2].map(n => (
                    <div key={n} className="h-14 bg-surface-input rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : paymentHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center text-text-secondary">
                  <History className="w-8 h-8 text-text-muted mb-2" />
                  <p className="text-xs">Belum ada transaksi pembayaran yang dicatat.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {paymentHistory.map((pmt) => (
                    <div 
                      key={pmt.id}
                      className="bg-surface-input border border-border/80 rounded-xl p-3 flex items-center justify-between text-xs transition-colors hover:border-border-strong"
                    >
                      <div>
                        <p className="font-bold font-mono text-text-primary text-sm">
                          {formatIDR(pmt.amount)}
                        </p>
                        <p className="text-xxs text-text-secondary mt-1 flex items-center gap-1.5">
                          <span>Via: <strong className="text-text-primary">{pmt.wallets?.name || "Dompet Terhapus"}</strong></span>
                          <span>•</span>
                          <span>{new Date(pmt.payment_date).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          })}</span>
                        </p>
                      </div>

                      <button
                        onClick={() => setPaymentToDelete(pmt)}
                        title="Hapus Pembayaran"
                        className="p-2 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-border flex justify-end">
              <button
                onClick={() => {
                  setIsHistoryModalOpen(false);
                  setSelectedDebtForHistory(null);
                  setPaymentHistory([]);
                }}
                className="px-5 py-2 bg-surface-input hover:bg-surface-hover border border-border text-text-primary rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= CONFIRM DELETE DEBT ================= */}
      {debtToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-card border border-border rounded-2xl w-full max-w-sm shadow-2xl p-6 relative animate-in scale-in duration-200">
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-danger shrink-0" />
              Hapus Catatan Hutang/Piutang?
            </h2>
            <p className="text-xs text-text-secondary mt-2 leading-relaxed">
              Apakah Anda yakin ingin menghapus catatan milik <strong className="text-text-primary">{debtToDelete.name}</strong>? Tindakan ini akan menghapus seluruh riwayat cicilan terkait, tetapi <strong>tidak akan memulihkan saldo dompet Anda</strong> yang telah terpotong sebelumnya.
            </p>
            <div className="flex gap-2 mt-4 pt-1">
              <button
                onClick={() => setDebtToDelete(null)}
                className="flex-1 px-4 py-2 bg-surface-input hover:bg-surface-hover border border-border text-text-primary rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteDebt}
                className="flex-1 px-4 py-2 bg-danger hover:bg-danger/90 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= CONFIRM DELETE PAYMENT ================= */}
      {paymentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-card border border-border rounded-2xl w-full max-w-sm shadow-2xl p-6 relative animate-in scale-in duration-200">
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-danger shrink-0" />
              Hapus Riwayat Pembayaran?
            </h2>
            <p className="text-xs text-text-secondary mt-2 leading-relaxed">
              Apakah Anda yakin ingin menghapus pembayaran sebesar <strong className="text-text-primary">{formatIDR(paymentToDelete.amount)}</strong>? 
              Tindakan ini secara otomatis akan <strong>mengembalikan saldo dompet Anda</strong> ke keadaan semula.
            </p>
            <div className="flex gap-2 mt-4 pt-1">
              <button
                onClick={() => setPaymentToDelete(null)}
                className="flex-1 px-4 py-2 bg-surface-input hover:bg-surface-hover border border-border text-text-primary rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleDeletePayment}
                className="flex-1 px-4 py-2 bg-danger hover:bg-danger/90 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                Hapus Pembayaran
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

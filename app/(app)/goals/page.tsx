"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getIconComponent } from "@/lib/utils/icons";
import { useApp } from "@/app/providers/AppProvider";
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  Check, 
  AlertCircle, 
  Calendar,
  X,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  History,
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  Info
} from "lucide-react";

interface SavingGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  status: "ongoing" | "achieved" | "withdrawn";
  icon: string;
  created_at: string;
  updated_at: string;
}

interface WalletItem {
  id: string;
  name: string;
  balance: number;
}

interface GoalTransaction {
  id: string;
  goal_id: string;
  wallet_id: string;
  amount: number;
  date: string;
  type: "topup" | "withdrawal";
  wallet_name: string;
  created_at: string;
}

const GOAL_ICONS = [
  "PiggyBank", "Star", "Wallet", "Coins", "Banknote", "Building", 
  "Briefcase", "Car", "Utensils", "ShoppingBag", "Film", "Smartphone"
];

export default function GoalsPage() {
  const supabase = createClient();
  const { user, wallets, refreshWallets } = useApp();

  // Data States
  const [goals, setGoals] = useState<SavingGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "ongoing" | "achieved" | "withdrawn">("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Toast States
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modal Control States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<SavingGoal | null>(null);
  const [txToDelete, setTxToDelete] = useState<GoalTransaction | null>(null);

  // Form State - Add / Edit Saving Goal
  const [formName, setFormName] = useState("");
  const [formTargetAmount, setFormTargetAmount] = useState("");
  const [formTargetDate, setFormTargetDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return d.toISOString().split("T")[0];
  });
  const [formIcon, setFormIcon] = useState("PiggyBank");
  const [editingGoal, setEditingGoal] = useState<SavingGoal | null>(null);
  const [submittingGoal, setSubmittingGoal] = useState(false);

  // Form State - Top-up / Withdrawal
  const [selectedGoal, setSelectedGoal] = useState<SavingGoal | null>(null);
  const [txAmount, setTxAmount] = useState("");
  const [txWalletId, setTxWalletId] = useState("");
  const [txDate, setTxDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [submittingTx, setSubmittingTx] = useState(false);

  // History State
  const [historyGoal, setHistoryGoal] = useState<SavingGoal | null>(null);
  const [transactionsHistory, setTransactionsHistory] = useState<GoalTransaction[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Load Goals when user changes
  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user]);

  // Set default wallet ID when wallets are loaded
  useEffect(() => {
    const activeWallets = wallets.filter(w => !w.is_archived);
    if (activeWallets.length > 0 && !txWalletId) {
      setTxWalletId(activeWallets[0].id);
    }
  }, [wallets, txWalletId]);

  const showToast = (message: string, isSuccess = true) => {
    if (isSuccess) {
      setSuccessMsg(message);
      setTimeout(() => setSuccessMsg(null), 3000);
    } else {
      setErrorMsg(message);
      setTimeout(() => setErrorMsg(null), 4000);
    }
  };

  // Fetch Goals
  async function fetchGoals() {
    try {
      setLoading(true);
      setErrorMsg(null);
      const { data, error } = await supabase
        .from("saving_goals")
        .select("*")
        .order("target_date", { ascending: true });

      if (error) throw error;
      setGoals(data || []);
    } catch (err: any) {
      console.error(err);
      showToast("Gagal memuat target tabungan: " + err.message, false);
    } finally {
      setLoading(false);
    }
  }

  // Create / Edit Submit
  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast("Nama target tidak boleh kosong", false);
      return;
    }
    const targetNum = parseFloat(formTargetAmount);
    if (isNaN(targetNum) || targetNum <= 0) {
      showToast("Jumlah target harus lebih besar dari 0", false);
      return;
    }
    if (!user) return;

    try {
      setSubmittingGoal(true);
      if (editingGoal) {
        // Edit
        const { error } = await supabase
          .from("saving_goals")
          .update({
            name: formName.trim(),
            target_amount: targetNum,
            target_date: formTargetDate,
            icon: formIcon
          })
          .eq("id", editingGoal.id);

        if (error) throw error;
        showToast("Target tabungan berhasil diperbarui!");
        setIsEditModalOpen(false);
      } else {
        // Create new
        const { error } = await supabase
          .from("saving_goals")
          .insert([{
            user_id: user.id,
            name: formName.trim(),
            target_amount: targetNum,
            target_date: formTargetDate,
            icon: formIcon,
            current_amount: 0.00,
            status: "ongoing"
          }]);

        if (error) throw error;
        showToast("Target tabungan baru berhasil ditambahkan!");
        setIsAddModalOpen(false);
      }

      resetGoalForm();
      await fetchGoals();
    } catch (err: any) {
      console.error(err);
      showToast("Gagal menyimpan target: " + err.message, false);
    } finally {
      setSubmittingGoal(false);
    }
  };

  const resetGoalForm = () => {
    setFormName("");
    setFormTargetAmount("");
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    setFormTargetDate(d.toISOString().split("T")[0]);
    setFormIcon("PiggyBank");
    setEditingGoal(null);
  };

  const openEditModal = (goal: SavingGoal) => {
    setEditingGoal(goal);
    setFormName(goal.name);
    setFormTargetAmount(goal.target_amount.toString());
    setFormTargetDate(goal.target_date);
    setFormIcon(goal.icon);
    setIsEditModalOpen(true);
  };

  // Delete Goal
  const handleDeleteGoal = async () => {
    if (!goalToDelete) return;
    try {
      const { error } = await supabase
        .from("saving_goals")
        .delete()
        .eq("id", goalToDelete.id);

      if (error) throw error;
      showToast("Target tabungan berhasil dihapus");
      setGoalToDelete(null);
      await fetchGoals();
    } catch (err: any) {
      console.error(err);
      showToast("Gagal menghapus target: " + err.message, false);
    }
  };

  // Topup / Withdraw submits
  const handleSaveTransaction = async (e: React.FormEvent, type: "topup" | "withdrawal") => {
    e.preventDefault();
    if (!selectedGoal) return;
    const amountNum = parseFloat(txAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      showToast("Jumlah dana harus lebih besar dari 0", false);
      return;
    }
    if (!txWalletId) {
      showToast("Silakan pilih dompet transaksi", false);
      return;
    }

    if (type === "withdrawal" && amountNum > selectedGoal.current_amount + 0.01) {
      showToast(`Jumlah penarikan melebihi dana terkumpul saat ini (${formatIDR(selectedGoal.current_amount)})`, false);
      return;
    }

    try {
      setSubmittingTx(true);
      const tableName = type === "topup" ? "goal_topups" : "goal_withdrawals";
      const relationKey = type === "topup" ? "topup_date" : "withdrawal_date";

      // Insert topup or withdrawal
      const { error } = await supabase
        .from(tableName)
        .insert([{
          goal_id: selectedGoal.id,
          wallet_id: txWalletId,
          amount: amountNum,
          [relationKey]: txDate
        }]);

      if (error) throw error;
      
      showToast(type === "topup" ? "Top-up tabungan berhasil!" : "Penarikan tabungan berhasil!");
      setIsTopupModalOpen(false);
      setIsWithdrawModalOpen(false);
      
      // Reset Form
      setTxAmount("");
      setSelectedGoal(null);

      // Refresh Data
      await fetchGoals();
      await refreshWallets();
    } catch (err: any) {
      console.error(err);
      showToast("Transaksi gagal: " + err.message, false);
    } finally {
      setSubmittingTx(false);
    }
  };

  const openTxModal = (goal: SavingGoal, type: "topup" | "withdrawal") => {
    setSelectedGoal(goal);
    setTxDate(new Date().toISOString().split("T")[0]);
    if (type === "topup") {
      const remaining = goal.target_amount - goal.current_amount;
      setTxAmount(remaining > 0 ? remaining.toString() : "");
      setIsTopupModalOpen(true);
    } else {
      setTxAmount(goal.current_amount.toString());
      setIsWithdrawModalOpen(true);
    }
  };

  // Fetch History for Goal
  async function fetchHistory(goalId: string) {
    try {
      setLoadingHistory(true);
      
      // 1. Fetch topups
      const { data: topups, error: topupErr } = await supabase
        .from("goal_topups")
        .select(`
          id,
          goal_id,
          wallet_id,
          amount,
          topup_date,
          created_at,
          wallets(name)
        `)
        .eq("goal_id", goalId);

      if (topupErr) throw topupErr;

      // 2. Fetch withdrawals
      const { data: withdrawals, error: wdrawErr } = await supabase
        .from("goal_withdrawals")
        .select(`
          id,
          goal_id,
          wallet_id,
          amount,
          withdrawal_date,
          created_at,
          wallets(name)
        `)
        .eq("goal_id", goalId);

      if (wdrawErr) throw wdrawErr;

      // Map & merge
      const historyList: GoalTransaction[] = [
        ...(topups || []).map((t: any) => ({
          id: t.id,
          goal_id: t.goal_id,
          wallet_id: t.wallet_id,
          amount: parseFloat(t.amount),
          date: t.topup_date,
          type: "topup" as const,
          wallet_name: t.wallets?.name || "Dompet Terhapus",
          created_at: t.created_at
        })),
        ...(withdrawals || []).map((w: any) => ({
          id: w.id,
          goal_id: w.goal_id,
          wallet_id: w.wallet_id,
          amount: parseFloat(w.amount),
          date: w.withdrawal_date,
          type: "withdrawal" as const,
          wallet_name: w.wallets?.name || "Dompet Terhapus",
          created_at: w.created_at
        }))
      ];

      // Sort by date desc, then created_at desc
      historyList.sort((a, b) => {
        const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
        if (dateDiff !== 0) return dateDiff;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setTransactionsHistory(historyList);
    } catch (err: any) {
      console.error(err);
      showToast("Gagal memuat riwayat tabungan: " + err.message, false);
    } finally {
      setLoadingHistory(false);
    }
  }

  const openHistoryModal = async (goal: SavingGoal) => {
    setHistoryGoal(goal);
    setIsHistoryModalOpen(true);
    await fetchHistory(goal.id);
  };

  // Revert a transaction from history
  const handleDeleteTransaction = async () => {
    if (!txToDelete || !historyGoal) return;
    try {
      const tableName = txToDelete.type === "topup" ? "goal_topups" : "goal_withdrawals";
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq("id", txToDelete.id);

      if (error) throw error;
      showToast("Transaksi berhasil dihapus & saldo dikembalikan!");
      setTxToDelete(null);

      // Refresh data
      await fetchHistory(historyGoal.id);
      await fetchGoals();
      await refreshWallets();
    } catch (err: any) {
      console.error(err);
      showToast("Gagal menghapus transaksi: " + err.message, false);
    }
  };

  // ETA Calculation helper
  const calculateETAInfo = (goal: SavingGoal, history: GoalTransaction[] = []) => {
    const remaining = goal.target_amount - goal.current_amount;
    if (remaining <= 0) {
      return { status: "achieved", msg: "Target Tercapai!" };
    }

    const today = new Date();
    today.setHours(0,0,0,0);
    const target = new Date(goal.target_date);
    target.setHours(0,0,0,0);

    const msDiff = target.getTime() - today.getTime();
    const daysDiff = Math.ceil(msDiff / (1000 * 60 * 60 * 24));

    if (daysDiff <= 0) {
      return { 
        status: "late", 
        msg: "Lewat batas target tanggal", 
        needed: `Butuh Rp ${formatIDR(remaining)} untuk lunas` 
      };
    }

    // Weekly contribution required
    const weeksRemaining = Math.max(1, daysDiff / 7);
    const requiredWeekly = Math.round(remaining / weeksRemaining);

    // Monthly contribution required
    const monthsRemaining = Math.max(1, daysDiff / 30);
    const requiredMonthly = Math.round(remaining / monthsRemaining);

    return {
      status: "ongoing",
      daysLeft: daysDiff,
      msg: `${daysDiff} hari lagi`,
      requiredWeekly,
      requiredMonthly
    };
  };

  // Formatting and utilities
  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  const filteredGoals = goals.filter((item) => {
    const matchesFilter = statusFilter === "all" || item.status === statusFilter;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Summary Metrics
  const totalTargetOngoing = goals
    .filter(g => g.status === "ongoing")
    .reduce((sum, g) => sum + g.target_amount, 0);

  const totalCollected = goals
    .filter(g => g.status !== "withdrawn")
    .reduce((sum, g) => sum + g.current_amount, 0);

  const completedGoalsCount = goals.filter(g => g.status === "achieved").length;

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
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Rencana Tabungan (Goals)</h1>
          <p className="text-sm text-text-secondary mt-0.5">Rencanakan, tabung, dan capai impian finansial Anda secara terstruktur.</p>
        </div>
        <button
          onClick={() => {
            resetGoalForm();
            setIsAddModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-medium transition-colors hover:shadow-lg hover:shadow-primary/10 cursor-pointer w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Tambah Target
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-card border border-border rounded-2xl p-5 relative overflow-hidden group shadow-sm">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
          <p className="text-xs font-medium text-text-secondary">Target Aktif Berjalan</p>
          <p className="text-xl sm:text-2xl font-bold text-text-primary font-mono mt-1">{formatIDR(totalTargetOngoing)}</p>
        </div>

        <div className="bg-surface-card border border-border rounded-2xl p-5 relative overflow-hidden group shadow-sm">
          <div className="absolute top-0 right-0 w-24 h-24 bg-success/5 rounded-full blur-2xl" />
          <p className="text-xs font-medium text-text-secondary">Total Dana Terkumpul</p>
          <p className="text-xl sm:text-2xl font-bold text-success font-mono mt-1">{formatIDR(totalCollected)}</p>
        </div>

        <div className="bg-surface-card border border-border rounded-2xl p-5 relative overflow-hidden group shadow-sm">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl" />
          <p className="text-xs font-medium text-text-secondary">Target Berhasil Dicapai</p>
          <p className="text-xl sm:text-2xl font-bold text-amber-500 font-mono mt-1">{completedGoalsCount} Target</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        {/* Status Filter tabs */}
        <div className="bg-surface-input p-1 rounded-xl flex gap-1 self-start overflow-x-auto max-w-full">
          {[
            { key: "all", label: "Semua" },
            { key: "ongoing", label: "Aktif" },
            { key: "achieved", label: "Tercapai" },
            { key: "withdrawn", label: "Ditarik" }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key as any)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === tab.key 
                  ? "bg-surface-card text-text-primary shadow-sm border border-border" 
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-60">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari target tabungan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface-input border border-border focus:border-primary focus:outline-none rounded-xl text-xs text-text-primary font-medium"
          />
        </div>
      </div>

      {/* Goals Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 bg-surface-card border border-border rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredGoals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 border border-dashed border-border rounded-2xl text-center">
          <div className="w-12 h-12 rounded-full bg-surface-hover flex items-center justify-center text-text-muted mb-3">
            <PiggyBank className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-text-primary">Tidak ada target tabungan</h3>
          <p className="text-sm text-text-secondary mt-1 max-w-sm">
            {searchTerm 
              ? "Coba ganti kata kunci pencarian Anda." 
              : "Mulai buat target impian baru dan kelola tabungan Anda."}
          </p>
          {!searchTerm && statusFilter === "all" && (
            <button
              onClick={() => {
                resetGoalForm();
                setIsAddModalOpen(true);
              }}
              className="mt-4 inline-flex items-center gap-1 text-sm text-primary font-semibold hover:underline"
            >
              Tambah target pertama Anda →
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGoals.map((goal) => {
            const progress = Math.min(100, (goal.current_amount / goal.target_amount) * 100);
            const remaining = Math.max(0, goal.target_amount - goal.current_amount);
            const eta = calculateETAInfo(goal);
            const IconComp = getIconComponent(goal.icon);

            return (
              <div 
                key={goal.id} 
                className="bg-surface-card border border-border hover:border-border-strong rounded-2xl p-5 flex flex-col justify-between transition-all shadow-sm hover:shadow-md relative overflow-hidden group"
              >
                {/* Status indicator border top */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                  goal.status === "achieved" ? "bg-success" : goal.status === "withdrawn" ? "bg-text-muted" : "bg-primary"
                }`} />

                {/* Top Header Card */}
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        goal.status === "achieved" 
                          ? "bg-success/10 text-success" 
                          : goal.status === "withdrawn" ? "bg-surface-hover text-text-muted" : "bg-primary/10 text-primary"
                      }`}>
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-text-primary text-sm sm:text-base leading-tight group-hover:text-primary transition-colors">
                          {goal.name}
                        </h3>
                        <span className={`inline-block px-1.5 py-0.5 rounded text-xxxxs font-bold mt-1 tracking-wider uppercase ${
                          goal.status === "achieved" 
                            ? "bg-success/10 text-success border border-success/20" 
                            : goal.status === "withdrawn" 
                              ? "bg-surface-hover text-text-muted border border-border" 
                              : "bg-primary/10 text-primary border border-primary/20"
                        }`}>
                          {goal.status === "achieved" ? "Tercapai" : goal.status === "withdrawn" ? "Ditarik" : "Berjalan"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(goal)}
                        className="p-1.5 text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface-hover transition-colors cursor-pointer"
                        title="Edit Target"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setGoalToDelete(goal)}
                        className="p-1.5 text-text-secondary hover:text-danger rounded-lg hover:bg-danger/10 transition-colors cursor-pointer"
                        title="Hapus Target"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Ring / Bar Info */}
                  <div className="mt-5 space-y-2">
                    <div className="flex justify-between text-xs">
                      <div>
                        <p className="text-text-muted text-xxs">Terkumpul</p>
                        <p className="font-bold text-text-primary font-mono mt-0.5">{formatIDR(goal.current_amount)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-text-muted text-xxs">Target</p>
                        <p className="font-bold text-text-primary font-mono mt-0.5">{formatIDR(goal.target_amount)}</p>
                      </div>
                    </div>

                    {/* Horizontal Progress bar */}
                    <div>
                      <div className="w-full h-2 bg-surface-input rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            goal.status === "achieved" ? "bg-success" : goal.status === "withdrawn" ? "bg-text-muted" : "bg-primary"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-xxs text-text-secondary mt-1 font-mono">
                        <span>Sisa: {formatIDR(remaining)}</span>
                        <span>{progress.toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ETA details section */}
                <div className="mt-4 pt-3 border-t border-border/40 bg-surface/30 p-2.5 rounded-xl border border-border/20">
                  <div className="flex items-start gap-1.5 text-xxs text-text-secondary">
                    <Calendar className="w-3.5 h-3.5 text-text-muted shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p>
                        Batas Target:{" "}
                        <strong className="text-text-primary">
                          {new Date(goal.target_date).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          })}
                        </strong>
                      </p>
                      
                      {eta.status === "ongoing" && eta.daysLeft && (
                        <p className="text-xxxxs text-text-muted leading-relaxed">
                          Estimasi: <span className="font-semibold text-primary">{eta.msg}</span>. 
                          Butuh <span className="font-semibold text-text-primary font-mono">{formatIDR(eta.requiredWeekly || 0)}/minggu</span> atau <span className="font-semibold text-text-primary font-mono">{formatIDR(eta.requiredMonthly || 0)}/bulan</span>.
                        </p>
                      )}
                      
                      {eta.status === "late" && (
                        <p className="text-xxxxs text-danger font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          Melewati tenggat tanggal target ({formatIDR(remaining)} sisa).
                        </p>
                      )}

                      {eta.status === "achieved" && (
                        <p className="text-xxxxs text-success font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3 shrink-0" />
                          Dana tabungan target Anda sudah terkumpul penuh!
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 pt-3 border-t border-border/40 flex items-center gap-2">
                  <button
                    onClick={() => openHistoryModal(goal)}
                    className="flex-1 px-2.5 py-2 bg-surface-input hover:bg-surface-hover border border-border text-text-primary rounded-xl text-xxs font-medium flex items-center justify-center gap-1 transition-all cursor-pointer"
                    title="Lihat Riwayat Top-up & Penarikan"
                  >
                    <History className="w-3.5 h-3.5" />
                    Riwayat
                  </button>

                  {/* Draw / Top-up Action depending on states */}
                  {goal.status === "ongoing" && (
                    <button
                      onClick={() => openTxModal(goal, "topup")}
                      className="flex-1 px-2.5 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xxs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer hover:shadow-md hover:shadow-primary/5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Top-up
                    </button>
                  )}

                  {goal.status === "achieved" && (
                    <button
                      onClick={() => openTxModal(goal, "withdrawal")}
                      className="flex-1 px-2.5 py-2 bg-success hover:bg-success/90 text-white rounded-xl text-xxs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer hover:shadow-md hover:shadow-success/5"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      Tarik Dana
                    </button>
                  )}

                  {goal.status === "withdrawn" && (
                    <button
                      disabled
                      className="flex-1 px-2.5 py-2 bg-surface-hover border border-border/40 text-text-muted rounded-xl text-xxs font-medium flex items-center justify-center gap-1"
                    >
                      Sudah Ditarik
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT SAVING GOAL ================= */}
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
              {isEditModalOpen ? "Edit Target Tabungan" : "Tambah Target Tabungan"}
            </h2>

            <form onSubmit={handleSaveGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Nama Target Impian <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Beli Laptop Baru, DP Rumah, Liburan"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-surface-input border border-border focus:border-primary focus:outline-none rounded-xl text-sm text-text-primary font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Jumlah Dana Target (Rp) <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  placeholder="0"
                  value={formTargetAmount}
                  onChange={(e) => setFormTargetAmount(e.target.value)}
                  className="w-full px-3.5 py-2 bg-surface-input border border-border focus:border-primary focus:outline-none rounded-xl text-sm text-text-primary font-mono font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Batas Waktu (Target Tanggal) <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formTargetDate}
                  onChange={(e) => setFormTargetDate(e.target.value)}
                  className="w-full px-3.5 py-2 bg-surface-input border border-border focus:border-primary focus:outline-none rounded-xl text-sm text-text-primary font-medium"
                />
              </div>

              {/* Icon Picker Grid */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Pilih Ikon Representasi
                </label>
                <div className="grid grid-cols-6 gap-2 bg-surface-input p-2 rounded-xl border border-border">
                  {GOAL_ICONS.map((icoName) => {
                    const TargetIcon = getIconComponent(icoName);
                    return (
                      <button
                        key={icoName}
                        type="button"
                        onClick={() => setFormIcon(icoName)}
                        className={`p-2.5 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                          formIcon === icoName 
                            ? "bg-primary text-white shadow-md shadow-primary/20 scale-110" 
                            : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                        }`}
                      >
                        <TargetIcon className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
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
                  disabled={submittingGoal}
                  className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors hover:shadow-lg hover:shadow-primary/10 cursor-pointer"
                >
                  {submittingGoal ? "Menyimpan..." : "Simpan Target"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: TOP-UP GOAL ================= */}
      {isTopupModalOpen && selectedGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-card border border-border rounded-2xl w-full max-w-sm shadow-2xl p-6 relative animate-in scale-in duration-200">
            <button
              onClick={() => {
                setIsTopupModalOpen(false);
                setSelectedGoal(null);
              }}
              className="absolute top-4 right-4 text-text-secondary hover:text-text-primary cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-text-primary mb-1">
              Top-up Tabungan
            </h2>
            <p className="text-xs text-text-secondary mb-4">
              Menabung sebagian dana Anda ke target <span className="font-semibold text-text-primary">{selectedGoal.name}</span>.
            </p>

            <form onSubmit={(e) => handleSaveTransaction(e, "topup")} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Sumber Dompet Tabungan <span className="text-danger">*</span>
                </label>
                <select
                  required
                  value={txWalletId}
                  onChange={(e) => setTxWalletId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-input border border-border focus:border-primary focus:outline-none rounded-xl text-sm text-text-primary font-medium"
                >
                  <option value="" disabled>Pilih Dompet</option>
                  {wallets.filter((w) => !w.is_archived).map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({formatIDR(w.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Jumlah Top-up (Rp) <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  placeholder="0"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  className="w-full px-3.5 py-2 bg-surface-input border border-border focus:border-primary focus:outline-none rounded-xl text-sm text-text-primary font-mono font-medium"
                />
                <span className="text-xxxxs text-text-muted mt-1 block">
                  Dana Kurang untuk Target: {formatIDR(selectedGoal.target_amount - selectedGoal.current_amount)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Tanggal Top-up <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={txDate}
                  onChange={(e) => setTxDate(e.target.value)}
                  className="w-full px-3.5 py-2 bg-surface-input border border-border focus:border-primary focus:outline-none rounded-xl text-sm text-text-primary font-medium"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsTopupModalOpen(false);
                    setSelectedGoal(null);
                  }}
                  className="flex-1 px-4 py-2.5 bg-surface-input hover:bg-surface-hover border border-border text-text-primary rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingTx}
                  className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors hover:shadow-lg hover:shadow-primary/10 cursor-pointer"
                >
                  {submittingTx ? "Memproses..." : "Top-up Sekarang"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: WITHDRAW GOAL ================= */}
      {isWithdrawModalOpen && selectedGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-card border border-border rounded-2xl w-full max-w-sm shadow-2xl p-6 relative animate-in scale-in duration-200">
            <button
              onClick={() => {
                setIsWithdrawModalOpen(false);
                setSelectedGoal(null);
              }}
              className="absolute top-4 right-4 text-text-secondary hover:text-text-primary cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-text-primary mb-1">
              Tarik Dana Tabungan
            </h2>
            <p className="text-xs text-text-secondary mb-4">
              Menarik dana dari target <span className="font-semibold text-text-primary">{selectedGoal.name}</span> kembali ke dompet utama Anda.
            </p>

            <form onSubmit={(e) => handleSaveTransaction(e, "withdrawal")} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Tujuan Dompet Penerima <span className="text-danger">*</span>
                </label>
                <select
                  required
                  value={txWalletId}
                  onChange={(e) => setTxWalletId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-input border border-border focus:border-primary focus:outline-none rounded-xl text-sm text-text-primary font-medium"
                >
                  <option value="" disabled>Pilih Dompet</option>
                  {wallets.filter((w) => !w.is_archived).map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({formatIDR(w.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Jumlah Penarikan (Rp) <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  max={(selectedGoal.current_amount + 0.01).toString()}
                  placeholder="0"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  className="w-full px-3.5 py-2 bg-surface-input border border-border focus:border-primary focus:outline-none rounded-xl text-sm text-text-primary font-mono font-medium"
                />
                <span className="text-xxxxs text-text-muted mt-1 block">
                  Dana yang Tersedia: {formatIDR(selectedGoal.current_amount)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Tanggal Penarikan <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={txDate}
                  onChange={(e) => setTxDate(e.target.value)}
                  className="w-full px-3.5 py-2 bg-surface-input border border-border focus:border-primary focus:outline-none rounded-xl text-sm text-text-primary font-medium"
                />
              </div>

              {/* Warning notice */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl flex items-start gap-2 text-xxs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                  Penarikan dana tabungan akan menambah saldo di dompet yang Anda pilih, dan mengurangi dana terkumpul di target tabungan ini.
                </p>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsWithdrawModalOpen(false);
                    setSelectedGoal(null);
                  }}
                  className="flex-1 px-4 py-2.5 bg-surface-input hover:bg-surface-hover border border-border text-text-primary rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingTx}
                  className="flex-1 px-4 py-2.5 bg-success hover:bg-success/95 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors hover:shadow-lg hover:shadow-success/10 cursor-pointer"
                >
                  {submittingTx ? "Memproses..." : "Tarik Sekarang"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: TRANSACTION HISTORY ================= */}
      {isHistoryModalOpen && historyGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-card border border-border rounded-2xl w-full max-w-lg shadow-2xl p-6 relative animate-in scale-in duration-200 flex flex-col max-h-[85vh]">
            <button
              onClick={() => {
                setIsHistoryModalOpen(false);
                setHistoryGoal(null);
                setTransactionsHistory([]);
              }}
              className="absolute top-4 right-4 text-text-secondary hover:text-text-primary cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-text-primary mb-1">
              Riwayat Target Tabungan
            </h2>
            <p className="text-xs text-text-secondary mb-4">
              Aliran dana top-up dan penarikan untuk target <span className="font-semibold text-text-primary">{historyGoal.name}</span>.
            </p>

            <div className="flex-1 overflow-y-auto pr-1 space-y-3 min-h-[200px]">
              {loadingHistory ? (
                <div className="space-y-2 py-4">
                  {[1, 2].map(n => (
                    <div key={n} className="h-14 bg-surface-input rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : transactionsHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center text-text-secondary">
                  <History className="w-8 h-8 text-text-muted mb-2" />
                  <p className="text-xs">Belum ada riwayat top-up atau penarikan.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {transactionsHistory.map((tx) => (
                    <div 
                      key={tx.id}
                      className="bg-surface-input border border-border/80 rounded-xl p-3 flex items-center justify-between text-xs transition-colors hover:border-border-strong"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          tx.type === "topup" ? "bg-primary/15 text-primary" : "bg-success/15 text-success"
                        }`}>
                          {tx.type === "topup" ? (
                            <ArrowDownRight className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold font-mono text-text-primary text-sm">
                            {formatIDR(tx.amount)}
                          </p>
                          <p className="text-xxs text-text-secondary mt-0.5 flex items-center gap-1.5">
                            <span>{tx.type === "topup" ? "Top-up" : "Penarikan"} dari: <strong className="text-text-primary">{tx.wallet_name}</strong></span>
                            <span>•</span>
                            <span>{new Date(tx.date).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric"
                            })}</span>
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setTxToDelete(tx)}
                        className="p-2 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Transaksi"
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
                  setHistoryGoal(null);
                  setTransactionsHistory([]);
                }}
                className="px-5 py-2 bg-surface-input hover:bg-surface-hover border border-border text-text-primary rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= CONFIRM DELETE GOAL ================= */}
      {goalToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-card border border-border rounded-2xl w-full max-w-sm shadow-2xl p-6 relative animate-in scale-in duration-200">
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-danger shrink-0" />
              Hapus Target Tabungan?
            </h2>
            <p className="text-xs text-text-secondary mt-2 leading-relaxed">
              Apakah Anda yakin ingin menghapus target <strong className="text-text-primary">{goalToDelete.name}</strong>? Tindakan ini akan menghapus seluruh data target beserta riwayat top-up dan penarikannya secara permanen. <strong>Ini tidak akan mengembalikan saldo dompet Anda</strong> yang sudah ditop-up sebelumnya.
            </p>
            <div className="flex gap-2 mt-4 pt-1">
              <button
                onClick={() => setGoalToDelete(null)}
                className="flex-1 px-4 py-2 bg-surface-input hover:bg-surface-hover border border-border text-text-primary rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteGoal}
                className="flex-1 px-4 py-2 bg-danger hover:bg-danger/90 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= CONFIRM DELETE TRANSACTION ================= */}
      {txToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-card border border-border rounded-2xl w-full max-w-sm shadow-2xl p-6 relative animate-in scale-in duration-200">
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-danger shrink-0" />
              Hapus Transaksi Tabungan?
            </h2>
            <p className="text-xs text-text-secondary mt-2 leading-relaxed">
              Apakah Anda yakin ingin menghapus transaksi {txToDelete.type === "topup" ? "Top-up" : "Penarikan"} sebesar <strong className="text-text-primary">{formatIDR(txToDelete.amount)}</strong>? 
              Tindakan ini akan <strong>mengembalikan saldo dompet Anda</strong> dan menyelaraskan jumlah tabungan target ke keadaan sebelumnya.
            </p>
            <div className="flex gap-2 mt-4 pt-1">
              <button
                onClick={() => setTxToDelete(null)}
                className="flex-1 px-4 py-2 bg-surface-input hover:bg-surface-hover border border-border text-text-primary rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteTransaction}
                className="flex-1 px-4 py-2 bg-danger hover:bg-danger/90 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                Hapus Transaksi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

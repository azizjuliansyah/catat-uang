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
  Coins,
  Trash2,
  Edit2,
  History,
  Plus,
  ArrowUpRight,
  PiggyBank,
  CheckCircle2,
  AlertCircle,
  Clock,
  Wallet
} from "lucide-react";
import { formatIDR } from "@/lib/utils/format";
import { formatDateTimeShort, formatForDateTimeInput } from "@/lib/utils/date";
import { SavingGoal, GoalTransaction, ETAInfo } from "../types";
import { calculateETAInfo } from "../utils";
import { CustomSelect } from "@/components/ui/atoms/CustomSelect";

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null && "message" in err) {
    return (err as any).message;
  }
  return "Unknown error";
}

export default function GoalDetailPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { user, loadingUser, wallets, refreshWallets } = useApp();
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  const [goal, setGoal] = useState<SavingGoal | null>(null);
  const [transactions, setTransactions] = useState<GoalTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Visibility States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [showDeleteGoalModal, setShowDeleteGoalModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<GoalTransaction | null>(null);

  // Edit Goal Form States
  const [formName, setFormName] = useState("");
  const [formTargetAmount, setFormTargetAmount] = useState("");
  const [formTargetDate, setFormTargetDate] = useState("");
  const [formIcon, setFormIcon] = useState("PiggyBank");
  const [isSavingGoal, setIsSavingGoal] = useState(false);

  // Transaction Form States
  const [txAmount, setTxAmount] = useState("");
  const [txWalletId, setTxWalletId] = useState("");
  const [txDate, setTxDate] = useState("");
  const [isSavingTx, setIsSavingTx] = useState(false);

  // Deletion Submitting States
  const [isDeletingGoal, setIsDeletingGoal] = useState(false);
  const [isDeletingTx, setIsDeletingTx] = useState(false);

  // Fetch Page Data
  const loadData = useCallback(async () => {
    if (!id || !user) return;
    setLoading(true);
    try {
      const { data: goalData, error: goalError } = await supabase
        .from("saving_goals")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (goalError || !goalData) {
        showErrorToast("Target tabungan tidak ditemukan.");
        router.push("/goals");
        return;
      }

      setGoal(goalData);

      // Fetch topups
      const { data: topups, error: topupErr } = await supabase
        .from("goal_topups")
        .select(`
          id,
          goal_id,
          wallet_id,
          amount,
          topup_date,
          created_at,
          transaction_id,
          wallets(name)
        `)
        .eq("goal_id", id);

      if (topupErr) throw topupErr;

      // Fetch withdrawals
      const { data: withdrawals, error: wdrawErr } = await supabase
        .from("goal_withdrawals")
        .select(`
          id,
          goal_id,
          wallet_id,
          amount,
          withdrawal_date,
          created_at,
          transaction_id,
          wallets(name)
        `)
        .eq("goal_id", id);

      if (wdrawErr) throw wdrawErr;

      // Map & merge transactions
      const historyList: GoalTransaction[] = [
        ...(topups || []).map((t: any) => ({
          id: t.id,
          goal_id: t.goal_id,
          wallet_id: t.wallet_id,
          amount: parseFloat(t.amount),
          date: t.topup_date,
          type: "topup" as const,
          wallet_name: t.wallets?.name || "Dompet Terhapus",
          created_at: t.created_at,
          transaction_id: t.transaction_id || null
        })),
        ...(withdrawals || []).map((w: any) => ({
          id: w.id,
          goal_id: w.goal_id,
          wallet_id: w.wallet_id,
          amount: parseFloat(w.amount),
          date: w.withdrawal_date,
          type: "withdrawal" as const,
          wallet_name: w.wallets?.name || "Dompet Terhapus",
          created_at: w.created_at,
          transaction_id: w.transaction_id || null
        }))
      ];

      // Sort by date desc, then created_at desc
      historyList.sort((a, b) => {
        const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
        if (dateDiff !== 0) return dateDiff;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setTransactions(historyList);
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

  // Set default transaction date and wallet when modal opens
  useEffect(() => {
    const activeWallets = wallets.filter(w => !w.is_archived);
    const defaultWallet = activeWallets.find(w => w.is_default) || activeWallets[0];

    if (isTopupModalOpen || isWithdrawModalOpen) {
      setTxDate(formatForDateTimeInput(new Date().toISOString()));
      if (defaultWallet) {
        setTxWalletId(defaultWallet.id);
      }
    }
  }, [isTopupModalOpen, isWithdrawModalOpen, wallets]);

  // Open Edit Dialog
  const openEditModal = () => {
    if (!goal) return;
    setFormName(goal.name);
    setFormTargetAmount(goal.target_amount.toString());
    setFormTargetDate(formatForDateTimeInput(goal.target_date));
    setFormIcon(goal.icon || "PiggyBank");
    setIsEditModalOpen(true);
  };

  // Submit Save/Edit Goal
  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSavingGoal) return;

    if (!formName.trim()) {
      showErrorToast("Nama target tidak boleh kosong");
      return;
    }

    const amountNum = parseFloat(formTargetAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      showErrorToast("Jumlah target harus lebih besar dari 0");
      return;
    }

    if (!user || !goal) return;

    try {
      setIsSavingGoal(true);
      const isoTargetDate = new Date(formTargetDate).toISOString();

      const { error } = await supabase
        .from("saving_goals")
        .update({
          name: formName.trim(),
          target_amount: amountNum,
          target_date: isoTargetDate,
          icon: formIcon,
          updated_at: new Date().toISOString()
        })
        .eq("id", goal.id);

      if (error) throw error;

      showSuccessToast("Target tabungan berhasil diperbarui!");
      setIsEditModalOpen(false);
      await loadData();
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      showErrorToast("Gagal memperbarui target: " + message);
    } finally {
      setIsSavingGoal(false);
    }
  };

  // Submit Top-up Transaction
  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleTransaction(e, "topup");
  };

  // Submit Withdrawal Transaction
  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleTransaction(e, "withdrawal");
  };

  // Generic Transaction Handler
  const handleTransaction = async (e: React.FormEvent, type: "topup" | "withdrawal") => {
    if (isSavingTx) return;

    if (!goal || !user) return;
    const amountNum = parseFloat(txAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      showErrorToast("Jumlah harus lebih besar dari 0");
      return;
    }
    if (!txWalletId) {
      showErrorToast("Silakan pilih dompet transaksi");
      return;
    }

    // For withdrawal, check if enough funds available
    if (type === "withdrawal" && amountNum > goal.current_amount) {
      showErrorToast(`Jumlah penarikan melebihi dana terkumpul (${formatIDR(goal.current_amount)})`);
      return;
    }

    try {
      setIsSavingTx(true);

      const tableName = type === "topup" ? "goal_topups" : "goal_withdrawals";
      const dateColumn = type === "topup" ? "topup_date" : "withdrawal_date";
      const txType = type === "topup" ? "expense" : "income";
      const txDescription = type === "topup"
        ? `Top-up tabungan: ${goal.name}`
        : `Tarik tabungan: ${goal.name}`;

      const { data: newTx, error: newTxError } = await supabase
        .from("transactions")
        .insert([{
          user_id: user.id,
          wallet_id: txWalletId,
          paylater_id: null,
          category_id: null,
          amount: amountNum,
          type: txType,
          description: txDescription,
          transaction_date: new Date(txDate).toISOString(),
          receipt_url: null
        }])
        .select()
        .single();

      if (newTxError) throw newTxError;

      const { error: moduleError } = await supabase
        .from(tableName)
        .insert([{
          goal_id: goal.id,
          wallet_id: txWalletId,
          amount: amountNum,
          [dateColumn]: new Date(txDate).toISOString(),
          transaction_id: newTx.id
        }]);

      if (moduleError) {
        await supabase.from("transactions").delete().eq("id", newTx.id);
        throw moduleError;
      }

      showSuccessToast(type === "topup" ? "Top-up berhasil!" : "Penarikan berhasil!");
      if (type === "topup") {
        setIsTopupModalOpen(false);
      } else {
        setIsWithdrawModalOpen(false);
      }
      setTxAmount("");
      await loadData();
      await refreshWallets();
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      showErrorToast("Gagal: " + message);
    } finally {
      setIsSavingTx(false);
    }
  };

  // Submit Delete Goal
  const handleDeleteGoal = async () => {
    if (!goal) return;
    try {
      setIsDeletingGoal(true);
      const { error } = await supabase
        .from("saving_goals")
        .delete()
        .eq("id", goal.id);

      if (error) throw error;
      showSuccessToast("Target tabungan berhasil dihapus");
      router.push("/goals");
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      showErrorToast("Gagal menghapus target: " + message);
    } finally {
      setIsDeletingGoal(false);
    }
  };

  // Submit Delete Transaction
  const handleDeleteTransaction = async () => {
    if (!transactionToDelete || !goal) return;
    try {
      setIsDeletingTx(true);

      const tableName = transactionToDelete.type === "topup" ? "goal_topups" : "goal_withdrawals";
      const txId = transactionToDelete.transaction_id;

      const { error: deleteModuleError } = await supabase
        .from(tableName)
        .delete()
        .eq("id", transactionToDelete.id);

      if (deleteModuleError) throw deleteModuleError;

      if (txId) {
        const { error: deleteTxError } = await supabase
          .from("transactions")
          .delete()
          .eq("id", txId);
        if (deleteTxError) throw deleteTxError;
      }

      showSuccessToast("Transaksi berhasil dihapus");
      setTransactionToDelete(null);
      await loadData();
      await refreshWallets();
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      showErrorToast("Gagal menghapus transaksi: " + message);
    } finally {
      setIsDeletingTx(false);
    }
  };

  if (loading || !goal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-text-secondary">Memuat detail tabungan...</p>
      </div>
    );
  }

  const remaining = Math.max(0, goal.target_amount - goal.current_amount);
  const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
  const eta = calculateETAInfo(goal);
  const isAchieved = goal.status === "achieved";
  const isWithdrawn = goal.status === "withdrawn";
  const hasFunds = goal.current_amount > 0;

  const cardColor = isAchieved
    ? "#10b981" // Goal Complete
    : isWithdrawn
    ? "#a1a1aa" // Goal Withdrawn
    : "#8b5cf6"; // Goal Active

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Navigation and Top Toolbar */}
      <div className="flex flex-row justify-between">
        <Link
          href="/goals"
          className="inline-flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Link>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={openEditModal}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-xs cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Ubah
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteGoalModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-danger hover:bg-danger/10 hover:border-danger/20 text-xs cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Hapus
          </Button>
        </div>
      </div>

      {/* Goal Header Card */}
      <div className="bg-gradient-to-r from-surface-card to-surface/20 border border-border rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider ${
                isAchieved
                  ? "bg-success/10 text-success border border-success/20"
                  : isWithdrawn
                  ? "bg-text-secondary/15 text-text-secondary border border-border"
                  : "bg-goal-active/10 text-goal-active border border-goal-active/20"
              }`}>
                {isAchieved ? "Tercapai" : isWithdrawn ? "Ditarik" : "Berjalan"}
              </span>

              {eta.status === "late" && !isAchieved && !isWithdrawn && (
                <span className="px-2.5 py-1 bg-danger/10 text-danger border border-danger/20 rounded-lg text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 animate-pulse">
                  <Clock className="w-3 h-3" />
                  Terlewat
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              {goal.name}
            </h1>

            <p className="text-xs text-text-secondary flex items-center gap-1">
              <PiggyBank className="w-4 h-4 text-text-secondary" />
              Target tabungan impian Anda
            </p>
          </div>

          <div className="text-right space-y-1">
            <p className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider">Dana Terkumpul</p>
            <p className="text-3xl font-extrabold text-text-primary tracking-tight font-mono">
              {formatIDR(goal.current_amount)}
            </p>
          </div>
        </div>
      </div>

      {/* Grid statistics summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Target amount */}
        <div className="bg-surface-card border border-border p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <p className="text-xxs font-extrabold text-text-secondary uppercase tracking-wider flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-text-secondary" />
              Target Dana
            </p>
            <p className="text-xl font-bold text-text-primary mt-2 font-mono">
              {formatIDR(goal.target_amount)}
            </p>
          </div>
        </div>

        {/* Remaining amount */}
        <div className="bg-surface-card border border-border p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <p className="text-xxs font-extrabold text-text-secondary uppercase tracking-wider flex items-center gap-1">
              {isAchieved ? <CheckCircle2 className="w-3.5 h-3.5 text-success" /> : <AlertCircle className="w-3.5 h-3.5" />}
              {isAchieved ? "Kelebihan Dana" : "Sisa Diperlukan"}
            </p>
            <p className="text-xl font-bold text-text-primary mt-2 font-mono">
              {formatIDR(Math.abs(remaining))}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-surface-card border border-border p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <p className="text-xxs font-extrabold text-text-secondary uppercase tracking-wider">Progres Tabungan</p>
            <div className="w-full h-2 bg-surface-input rounded-full overflow-hidden mt-4">
              <div
                className={`h-full rounded-full transition-all duration-500`}
                style={{
                  width: `${Math.min(100, progress)}%`,
                  backgroundColor: cardColor
                }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-text-secondary mt-1.5 font-mono">
              <span>{progress.toFixed(1)}% Terkumpul</span>
            </div>
          </div>
        </div>
      </div>

      {/* Target Date & ETA Section */}
      <div className="bg-surface-card border border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-text-secondary" />
            Batas Waktu & Estimasi
          </h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-border/50">
            <span className="text-xs text-text-secondary">Tanggal Target</span>
            <span className="text-sm font-bold text-text-primary font-mono">
              {formatDateTimeShort(goal.target_date)}
            </span>
          </div>

          {eta.status === "ongoing" && eta.daysLeft !== undefined && (
            <div className="py-2 border-b border-border/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-text-secondary">Estimasi Waktu</span>
                <span className="text-sm font-bold text-primary">{eta.msg}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div className="bg-surface-hover rounded-lg p-3">
                  <p className="text-[10px] text-text-secondary uppercase tracking-wider">Per Minggu</p>
                  <p className="text-sm font-bold text-text-primary font-mono mt-1">
                    {formatIDR(eta.requiredWeekly || 0)}
                  </p>
                </div>
                <div className="bg-surface-hover rounded-lg p-3">
                  <p className="text-[10px] text-text-secondary uppercase tracking-wider">Per Bulan</p>
                  <p className="text-sm font-bold text-text-primary font-mono mt-1">
                    {formatIDR(eta.requiredMonthly || 0)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {eta.status === "late" && (
            <div className="py-2 bg-danger/5 rounded-lg border border-danger/20">
              <p className="text-xs text-danger font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Melewati batas target tanggal
              </p>
              <p className="text-[10px] text-danger/80 mt-1">
                Masih butuh {formatIDR(remaining)} untuk mencapai target.
              </p>
            </div>
          )}

          {eta.status === "achieved" && (
            <div className="py-2 bg-success/5 rounded-lg border border-success/20">
              <p className="text-xs text-success font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Target Tercapai!
              </p>
              <p className="text-[10px] text-success/80 mt-1">
                Selamat! Dana tabungan Anda sudah terkumpul penuh.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-surface-card border border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-extrabold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-4 h-4 text-text-secondary" />
              Riwayat Transaksi
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">Catatan top-up & penarikan</p>
          </div>

          <div className="flex items-center gap-2">
            {hasFunds && !isWithdrawn && (
              <Button
                onClick={() => setIsWithdrawModalOpen(true)}
                size="sm"
                variant="ghost"
                className="text-xs py-1.5 px-3 flex items-center gap-1 cursor-pointer font-bold border border-border"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                Tarik Dana
              </Button>
            )}
            {!isAchieved && !isWithdrawn && (
              <Button
                onClick={() => setIsTopupModalOpen(true)}
                size="sm"
                className="text-xs py-1.5 px-3 flex items-center gap-1 cursor-pointer font-bold bg-primary text-white"
              >
                <Plus className="w-3.5 h-3.5" />
                Top-up
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-xs text-text-secondary border border-dashed border-border rounded-xl">
              Belum ada transaksi dicatat.
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {transactions.map((tx, idx) => (
                <div
                  key={tx.id}
                  className={`flex items-center justify-between py-3.5 ${
                    idx === 0 ? "pt-0" : ""
                  } ${idx === transactions.length - 1 ? "pb-0" : ""}`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-xs font-bold font-mono ${
                          tx.type === "topup" ? "text-success" : "text-expense"
                        }`}
                      >
                        {tx.type === "topup" ? "+" : "-"}
                        {formatIDR(tx.amount)}
                      </p>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-surface-hover text-text-secondary border border-border">
                        {tx.type === "topup" ? "Top-up" : "Penarikan"}
                      </span>
                    </div>
                    <p className="text-[10px] text-text-secondary">
                      {tx.wallet_name || "Dompet Terhapus"} • {formatDateTimeShort(tx.date)}
                    </p>
                  </div>

                  <ActionButton
                    icon={Trash2}
                    title="Hapus Transaksi"
                    variant="danger"
                    onClick={() => setTransactionToDelete(tx)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {/* Edit Goal Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface-card border border-border rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-lg font-bold text-text-primary mb-4">Ubah Target Tabungan</h2>
            <form onSubmit={handleSaveGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">
                  Nama Target
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-input border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Contoh: Liburan ke Bali"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">
                  Target Dana
                </label>
                <input
                  type="number"
                  value={formTargetAmount}
                  onChange={(e) => setFormTargetAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-input border border-border rounded-lg text-sm text-text-primary font-mono focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">
                  Tanggal Target
                </label>
                <input
                  type="date"
                  value={formTargetDate}
                  onChange={(e) => setFormTargetDate(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-input border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  fullWidth
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isSavingGoal}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  fullWidth
                  disabled={isSavingGoal}
                >
                  {isSavingGoal ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Top-up Modal */}
      {isTopupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface-card border border-border rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-lg font-bold text-text-primary mb-4">Top-up Tabungan</h2>
            <form onSubmit={handleTopup} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">
                  Jumlah Top-up
                </label>
                <input
                  type="number"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-input border border-border rounded-lg text-sm text-text-primary font-mono focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="0"
                  min="0"
                  step="0.01"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">
                  Dari Dompet
                </label>
                <CustomSelect
                  value={txWalletId}
                  onChange={setTxWalletId}
                  options={wallets.filter(w => !w.is_archived).map((w) => ({
                    value: w.id,
                    label: `${w.name} (${formatIDR(w.balance)})`,
                    icon: <Wallet className="w-4 h-4 text-text-secondary" />
                  }))}
                  placeholder="Pilih dompet"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">
                  Tanggal
                </label>
                <input
                  type="date"
                  value={txDate}
                  onChange={(e) => setTxDate(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-input border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  fullWidth
                  onClick={() => setIsTopupModalOpen(false)}
                  disabled={isSavingTx}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  fullWidth
                  disabled={isSavingTx}
                >
                  {isSavingTx ? "Memproses..." : "Top-up"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface-card border border-border rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-lg font-bold text-text-primary mb-4">Tarik Dana Tabungan</h2>
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">
                  Jumlah Penarikan
                </label>
                <input
                  type="number"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-input border border-border rounded-lg text-sm text-text-primary font-mono focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="0"
                  min="0"
                  max={goal?.current_amount}
                  step="0.01"
                  autoFocus
                />
                <p className="text-[10px] text-text-secondary mt-1">
                  Tersedia: {formatIDR(goal?.current_amount || 0)}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">
                  Ke Dompet
                </label>
                <CustomSelect
                  value={txWalletId}
                  onChange={setTxWalletId}
                  options={wallets.filter(w => !w.is_archived).map((w) => ({
                    value: w.id,
                    label: `${w.name} (${formatIDR(w.balance)})`,
                    icon: <Wallet className="w-4 h-4 text-text-secondary" />
                  }))}
                  placeholder="Pilih dompet"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">
                  Tanggal
                </label>
                <input
                  type="date"
                  value={txDate}
                  onChange={(e) => setTxDate(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-input border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  fullWidth
                  onClick={() => setIsWithdrawModalOpen(false)}
                  disabled={isSavingTx}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  fullWidth
                  disabled={isSavingTx}
                >
                  {isSavingTx ? "Memproses..." : "Tarik"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Goal Modal */}
      {showDeleteGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface-card border border-border rounded-2xl w-full max-w-sm p-6 shadow-xl">
            <h2 className="text-lg font-bold text-text-primary mb-2">Hapus Target Tabungan?</h2>
            <p className="text-sm text-text-secondary mb-6">
              Tindakan ini akan menghapus "{goal?.name}" dan tidak dapat dibatalkan.
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setShowDeleteGoalModal(false)}
                disabled={isDeletingGoal}
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                fullWidth
                onClick={handleDeleteGoal}
                disabled={isDeletingGoal}
              >
                {isDeletingGoal ? "Menghapus..." : "Hapus"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Transaction Modal */}
      {transactionToDelete !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface-card border border-border rounded-2xl w-full max-w-sm p-6 shadow-xl">
            <h2 className="text-lg font-bold text-text-primary mb-2">Hapus Transaksi?</h2>
            <p className="text-sm text-text-secondary mb-6">
              Tindakan ini akan menghapus transaksi {transactionToDelete.type === "topup" ? "top-up" : "penarikan"} sebesar{" "}
              {formatIDR(transactionToDelete.amount)} dan tidak dapat dibatalkan.
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setTransactionToDelete(null)}
                disabled={isDeletingTx}
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                fullWidth
                onClick={handleDeleteTransaction}
                disabled={isDeletingTx}
              >
                {isDeletingTx ? "Menghapus..." : "Hapus"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

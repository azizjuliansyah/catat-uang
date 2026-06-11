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
  FileText, 
  ExternalLink,
  Plus,
  FileImage,
  CheckCircle2,
  Clock
} from "lucide-react";
import { formatIDR, isOverdue } from "../utils";
import { formatDateTimeShort, formatForDateTimeInput } from "@/lib/utils/date";
import { DebtItem, DebtPaymentItem, DebtPackage } from "../types";

import { DebtFormModal } from "../components/modals/DebtFormModal";
import { PaymentModal } from "../components/modals/PaymentModal";
import { DeleteDebtModal } from "../components/modals/DeleteDebtModal";
import { DeletePaymentModal } from "../components/modals/DeletePaymentModal";

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null && "message" in err) {
    return (err as any).message;
  }
  return "Unknown error";
}

export default function DebtDetailPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { user, loadingUser, wallets, refreshWallets } = useApp();
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  const [debt, setDebt] = useState<DebtItem | null>(null);
  const [payments, setPayments] = useState<DebtPaymentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Visibility States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [showDeleteDebtModal, setShowDeleteDebtModal] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<DebtPaymentItem | null>(null);

  // Edit Debt Form States
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<"owe" | "lend">("owe");
  const [formPackages, setFormPackages] = useState<DebtPackage[]>([]);
  const [isSavingDebt, setIsSavingDebt] = useState(false);

  // Pay Installment Form States
  const [payAmount, setPayAmount] = useState("");
  const [payWalletId, setPayWalletId] = useState("");
  const [payDate, setPayDate] = useState("");
  const [payProofFiles, setPayProofFiles] = useState<File[] | null>(null);
  const [payProofPreviews, setPayProofPreviews] = useState<string[] | null>(null);
  const [isSavingPayment, setIsSavingPayment] = useState(false);

  // Deletion Submitting States
  const [isDeletingDebt, setIsDeletingDebt] = useState(false);
  const [isDeletingPayment, setIsDeletingPayment] = useState(false);

  // Fetch Page Data
  const loadData = useCallback(async () => {
    if (!id || !user) return;
    setLoading(true);
    try {
      const { data: debtData, error: debtError } = await supabase
        .from("debts")
        .select(`
          *,
          debt_transactions (
            *,
            debt_transaction_proofs (*)
          )
        `)
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (debtError || !debtData) {
        showErrorToast("Data hutang/piutang tidak ditemukan.");
        router.push("/debts");
        return;
      }

      setDebt(debtData);

      const { data: paymentsData, error: paymentsError } = await supabase
        .from("debt_payments")
        .select("*, wallets (name), debt_payment_proofs (*)")
        .eq("debt_id", id)
        .order("payment_date", { ascending: false })
        .order("created_at", { ascending: false });

      if (paymentsError) throw paymentsError;

      setPayments(paymentsData || []);
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

  // Set default payment date and wallet when paying modal opens
  useEffect(() => {
    if (isPayModalOpen) {
      setPayDate(formatForDateTimeInput(new Date().toISOString()));
      const activeWallets = wallets.filter(w => !w.is_archived);
      const defaultWallet = activeWallets.find(w => w.is_default) || activeWallets[0];
      if (defaultWallet) {
        setPayWalletId(defaultWallet.id);
      }
    }
  }, [isPayModalOpen, wallets]);

  // Open Edit Dialog
  const openEditModal = () => {
    if (!debt) return;
    setFormName(debt.name);
    setFormType(debt.type);

    // Get first transaction if exists
    const firstTxn = debt.debt_transactions?.[0];
    const existingProofUrl = firstTxn?.debt_transaction_proofs?.[0]?.proof_url || null;

    setFormPackages([
      {
        id: firstTxn?.id || debt.id,
        totalAmount: firstTxn?.amount?.toString() || debt.total_amount.toString(),
        dueDate: firstTxn?.due_date ? formatForDateTimeInput(firstTxn.due_date) : "",
        description: firstTxn?.description || "",
        proofFiles: null,
        proofPreviews: null,
        existingProofUrls: existingProofUrl ? [existingProofUrl] : null,
        shouldDeleteProofUrls: null
      }
    ]);
    setIsEditModalOpen(true);
  };

  // Submit Save/Edit Debt
  const handleSaveDebt = async (e: React.FormEvent) => {
    e.preventDefault();

    // Guard: Prevent double submission
    if (isSavingDebt) {
      return;
    }

    if (!formName.trim()) {
      showErrorToast("Nama kontak tidak boleh kosong");
      return;
    }
    if (formPackages.length === 0) return;

    const pkg = formPackages[0];
    const amountNum = parseFloat(pkg.totalAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      showErrorToast("Jumlah dana harus lebih besar dari 0");
      return;
    }

    if (!user || !debt) return;

    try {
      setIsSavingDebt(true);
      const isoDueDate = pkg.dueDate ? new Date(pkg.dueDate).toISOString() : null;

      // 1. Update parent debt (name and type only)
      const { error: updateDebtError } = await supabase
        .from("debts")
        .update({
          name: formName.trim(),
          type: formType,
          updated_at: new Date().toISOString()
        })
        .eq("id", debt.id);

      if (updateDebtError) throw updateDebtError;

      // 2. Get or create transaction
      let transactionId = pkg.id;
      const existingTxn = debt.debt_transactions?.[0];

      if (existingTxn) {
        // Update existing transaction
        const { error: updateTxnError } = await supabase
          .from("debt_transactions")
          .update({
            amount: amountNum,
            due_date: isoDueDate,
            description: pkg.description.trim() || null,
            updated_at: new Date().toISOString()
          })
          .eq("id", existingTxn.id);

        if (updateTxnError) throw updateTxnError;
        transactionId = existingTxn.id;
      } else {
        // Create new transaction
        const { data: newTxn, error: insertTxnError } = await supabase
          .from("debt_transactions")
          .insert({
            debt_id: debt.id,
            amount: amountNum,
            due_date: isoDueDate,
            description: pkg.description.trim() || null
          })
          .select()
          .single();

        if (insertTxnError) throw insertTxnError;
        transactionId = newTxn.id;
      }

      // 3. Handle proof deletions
      if (pkg.shouldDeleteProofUrls && pkg.shouldDeleteProofUrls.length > 0) {
        const { error: deleteProofError } = await supabase
          .from("debt_transaction_proofs")
          .delete()
          .eq("transaction_id", transactionId)
          .in("proof_url", pkg.shouldDeleteProofUrls);
        if (deleteProofError) throw deleteProofError;
      }

      // 4. Handle proof file uploads
      if (pkg.proofFiles && pkg.proofFiles.length > 0) {
        const proofUrlsToInsert: string[] = [];
        for (const file of pkg.proofFiles) {
          const fileExt = file.name.split(".").pop();
          const filePath = `${user.id}/debt-proof-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from("receipts")
            .upload(filePath, file, { upsert: true });

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from("receipts")
            .getPublicUrl(filePath);

          proofUrlsToInsert.push(publicUrl);
        }

        if (proofUrlsToInsert.length > 0) {
          const { error: insertProofError } = await supabase
            .from("debt_transaction_proofs")
            .insert(proofUrlsToInsert.map(url => ({
              transaction_id: transactionId,
              proof_url: url
            })));
          if (insertProofError) throw insertProofError;
        }
      }

      showSuccessToast("Data berhasil diperbarui!");
      setIsEditModalOpen(false);
      await loadData();
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      showErrorToast("Gagal memperbarui data: " + message);
    } finally {
      setIsSavingDebt(false);
    }
  };

  // Submit Record Payment
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    // Guard: Prevent double submission
    if (isSavingPayment) {
      return;
    }

    if (!debt || !user) return;
    const amountNum = parseFloat(payAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      showErrorToast("Jumlah pembayaran harus lebih besar dari 0");
      return;
    }
    if (!payWalletId) {
      showErrorToast("Silakan pilih dompet transaksi");
      return;
    }

    const remaining = debt.total_amount - debt.paid_amount;
    if (amountNum > remaining + 0.01) {
      showErrorToast(`Jumlah pembayaran melebihi sisa tagihan (${formatIDR(remaining)})`);
      return;
    }

    try {
      setIsSavingPayment(true);

      const { data: newPayment, error: paymentError } = await supabase
        .from("debt_payments")
        .insert([{
          debt_id: debt.id,
          wallet_id: payWalletId,
          amount: amountNum,
          payment_date: new Date(payDate).toISOString()
        }])
        .select()
        .single();

      if (paymentError) throw paymentError;

      // Handle multiple payment proofs
      if (payProofFiles && payProofFiles.length > 0) {
        const paymentProofUrls: string[] = [];
        for (const file of payProofFiles) {
          const fileExt = file.name.split(".").pop();
          const filePath = `${user.id}/payment-proof-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from("receipts")
            .upload(filePath, file, { upsert: true });

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from("receipts")
            .getPublicUrl(filePath);

          paymentProofUrls.push(publicUrl);
        }

        if (paymentProofUrls.length > 0) {
          const { error: insertProofError } = await supabase
            .from("debt_payment_proofs")
            .insert(paymentProofUrls.map(url => ({
              payment_id: newPayment.id,
              proof_url: url
            })));
          if (insertProofError) throw insertProofError;
        }
      }

      showSuccessToast("Pembayaran berhasil dicatat!");
      setIsPayModalOpen(false);
      setPayAmount("");
      setPayProofFiles(null);
      setPayProofPreviews(null);
      await loadData();
      await refreshWallets();
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      showErrorToast("Gagal mencatat pembayaran: " + message);
    } finally {
      setIsSavingPayment(false);
    }
  };

  // Submit Delete Debt
  const handleDeleteDebt = async () => {
    if (!debt) return;
    try {
      setIsDeletingDebt(true);
      const { error } = await supabase
        .from("debts")
        .delete()
        .eq("id", debt.id);

      if (error) throw error;
      showSuccessToast("Catatan hutang/piutang berhasil dihapus");
      router.push("/debts");
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      showErrorToast("Gagal menghapus catatan: " + message);
    } finally {
      setIsDeletingDebt(false);
    }
  };

  // Submit Delete Payment
  const handleDeletePayment = async () => {
    if (!paymentToDelete) return;
    try {
      setIsDeletingPayment(true);
      const { error } = await supabase
        .from("debt_payments")
        .delete()
        .eq("id", paymentToDelete.id);

      if (error) throw error;
      showSuccessToast("Pembayaran berhasil dihapus");
      setPaymentToDelete(null);
      await loadData();
      await refreshWallets();
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      showErrorToast("Gagal menghapus pembayaran: " + message);
    } finally {
      setIsDeletingPayment(false);
    }
  };

  if (loading || !debt) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-text-secondary">Memuat detail transaksi...</p>
      </div>
    );
  }

  const remaining = debt.total_amount - debt.paid_amount;
  const progress = debt.total_amount > 0 ? (debt.paid_amount / debt.total_amount) * 100 : 0;
  const firstTxnDueDate = debt.debt_transactions?.[0]?.due_date;
  const isLate = debt.status === "unpaid" && firstTxnDueDate && isOverdue(firstTxnDueDate);
  const isOwe = debt.type === "owe";

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Navigation and Top Toolbar */}
      <div className="flex flex-row justify-between">
        <Link 
          href="/debts" 
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
            onClick={() => setShowDeleteDebtModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-danger hover:bg-danger/10 hover:border-danger/20 text-xs cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Hapus
          </Button>
        </div>
      </div>

      {/* Profile/Contact Name Header */}
      <div className="bg-gradient-to-r from-surface-card to-surface/20 border border-border rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider ${
                isOwe 
                  ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" 
                  : "bg-cyan-500/10 text-cyan-500 border border-cyan-500/20"
              }`}>
                {isOwe ? "Hutang Saya" : "Piutang Saya"}
              </span>

              {debt.status === "paid" ? (
                <span className="px-2.5 py-1 bg-success/10 text-success border border-success/20 rounded-lg text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Lunas
                </span>
              ) : isLate ? (
                <span className="px-2.5 py-1 bg-danger/10 text-danger border border-danger/20 rounded-lg text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 animate-pulse">
                  <Clock className="w-3 h-3" />
                  Overdue / Terlewat
                </span>
              ) : (
                <span className="px-2.5 py-1 bg-text-secondary/15 text-text-secondary border border-border rounded-lg text-[10px] font-extrabold uppercase tracking-wider">
                  Belum Lunas
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              {debt.name}
            </h1>

            {debt.debt_transactions && debt.debt_transactions.length > 0 && (
              <p className="text-xs text-text-secondary flex items-center gap-1">
                <Calendar className="w-4 h-4 text-text-secondary" />
                {debt.debt_transactions.length === 1
                  ? `Jatuh tempo pada ${formatDateTimeShort(debt.debt_transactions[0].due_date)}`
                  : `${debt.debt_transactions.length} transaksi • lihat detail di bawah`
                }
              </p>
            )}
          </div>

          <div className="text-right space-y-1">
            <p className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider">Sisa Tagihan</p>
            <p className="text-3xl font-extrabold text-text-primary tracking-tight font-mono">
              {formatIDR(remaining)}
            </p>
          </div>
        </div>
      </div>

      {/* Grid statistics summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total amount */}
        <div className="bg-surface-card border border-border p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <p className="text-xxs font-extrabold text-text-secondary uppercase tracking-wider flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-text-secondary" />
              Total Pinjaman
            </p>
            <p className="text-xl font-bold text-text-primary mt-2 font-mono">
              {formatIDR(debt.total_amount)}
            </p>
          </div>
        </div>

        {/* Paid amount */}
        <div className="bg-surface-card border border-border p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <p className="text-xxs font-extrabold text-text-secondary uppercase tracking-wider flex items-center gap-1 text-success">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Total Terbayar
            </p>
            <p className="text-xl font-bold text-text-primary mt-2 font-mono">
              {formatIDR(debt.paid_amount)}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-surface-card border border-border p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <p className="text-xxs font-extrabold text-text-secondary uppercase tracking-wider">Progres Pelunasan</p>
            <div className="w-full h-2 bg-surface-input rounded-full overflow-hidden mt-4">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${debt.status === "paid" ? "bg-success" : isOwe ? "bg-amber-500" : "bg-cyan-500"}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-text-secondary mt-1.5 font-mono">
              <span>{progress.toFixed(1)}% Terbayar</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Groups and Payment History */}
      <div className="space-y-6">

        {/* Transaction Groups */}
        <div className="bg-surface-card border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-text-secondary" />
              Daftar Transaksi Hutang/Piutang
            </h3>
            <span className="text-[10px] text-text-muted">{debt.debt_transactions?.length || 0} item</span>
          </div>

          <div className="space-y-4">
            {debt.debt_transactions && debt.debt_transactions.length > 0 ? (
              debt.debt_transactions.map((txn, idx) => (
                <div key={txn.id} className="border border-border rounded-xl p-4 space-y-3 bg-surface/30">
                  {/* Transaction Header */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                      Transaksi #{idx + 1}
                    </span>
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                      txn.due_date && isOverdue(txn.due_date) && debt.status === "unpaid"
                        ? "bg-danger/10 text-danger border border-danger/20"
                        : "bg-surface-input text-text-secondary border border-border"
                    }`}>
                      {txn.due_date ? formatDateTimeShort(txn.due_date) : "Tidak ada tanggal jatuh tempo"}
                    </span>
                  </div>

                  {/* Amount */}
                  <div className="flex items-baseline gap-1">
                    <span className="text-xxs text-text-secondary">Jumlah:</span>
                    <span className="text-sm font-bold text-text-primary font-mono">{formatIDR(txn.amount)}</span>
                  </div>

                  {/* Description */}
                  {txn.description && (
                    <div className="space-y-1">
                      <span className="text-xxs text-text-secondary">Keterangan:</span>
                      <p className="text-xs text-text-primary whitespace-pre-wrap font-serif italic bg-surface/50 p-2 rounded-lg border border-border/40">
                        "{txn.description}"
                      </p>
                    </div>
                  )}

                  {/* Proofs for this transaction */}
                  {txn.debt_transaction_proofs && txn.debt_transaction_proofs.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xxs text-text-secondary">Bukti Lampiran ({txn.debt_transaction_proofs.length}):</span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {txn.debt_transaction_proofs.map((proof) => (
                          <a
                            key={proof.id}
                            href={proof.proof_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="border border-border rounded-lg overflow-hidden aspect-square bg-surface-input relative group hover:border-border-strong transition-colors"
                          >
                            <img
                              src={proof.proof_url}
                              alt="Bukti transaksi"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <ExternalLink className="w-4 h-4 text-white" />
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-text-secondary border border-dashed border-border rounded-xl">
                Tidak ada transaksi ditemukan.
              </div>
            )}
          </div>
        </div>

        {/* Payment History */}
        <div className="bg-surface-card border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-extrabold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-4 h-4 text-text-secondary" />
                Riwayat Pembayaran
              </h3>
              <p className="text-xxs text-text-secondary mt-0.5">Catatan cicilan yang telah dilakukan</p>
            </div>

            {debt.status === "unpaid" && (
              <Button
                onClick={() => setIsPayModalOpen(true)}
                size="sm"
                className="text-xs py-1.5 px-3 flex items-center gap-1 cursor-pointer font-bold bg-primary text-white"
              >
                <Plus className="w-3.5 h-3.5" />
                Bayar Cicilan
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
                {payments.map((pm, idx) => (
                  <div key={pm.id} className={`flex items-center justify-between py-3.5 ${idx === 0 ? "pt-0" : ""} ${idx === payments.length - 1 ? "pb-0" : ""}`}>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-text-primary font-mono">{formatIDR(pm.amount)}</p>
                      <p className="text-[10px] text-text-secondary">
                        Menggunakan {pm.wallets?.name || "Dompet Terhapus"} • {formatDateTimeShort(pm.payment_date)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      {pm.debt_payment_proofs && pm.debt_payment_proofs.length > 0 && (
                        <ActionButton
                          href={pm.debt_payment_proofs[0].proof_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Lihat Bukti Pembayaran"
                          icon={FileImage}
                          variant="primary"
                        />
                      )}
                      <ActionButton
                        icon={Trash2}
                        title="Hapus Pembayaran"
                        variant="danger"
                        onClick={() => setPaymentToDelete(pm)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Modals */}
      <DebtFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleSaveDebt}
        isEdit={true}
        formType={formType}
        setFormType={setFormType}
        formName={formName}
        setFormName={setFormName}
        formPackages={formPackages}
        setFormPackages={setFormPackages}
        isSubmitting={isSavingDebt}
        editingDebt={debt}
      />

      <PaymentModal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        onSubmit={handleRecordPayment}
        payingDebt={debt}
        payAmount={payAmount}
        setPayAmount={setPayAmount}
        payWalletId={payWalletId}
        setPayWalletId={setPayWalletId}
        payDate={payDate}
        setPayDate={setPayDate}
        payProofFiles={payProofFiles}
        setPayProofFiles={setPayProofFiles}
        payProofPreviews={payProofPreviews}
        setPayProofPreviews={setPayProofPreviews}
        isSubmitting={isSavingPayment}
        wallets={wallets}
      />

      <DeleteDebtModal
        isOpen={showDeleteDebtModal}
        onClose={() => setShowDeleteDebtModal(false)}
        debtToDelete={debt}
        onConfirm={handleDeleteDebt}
        isSubmitting={isDeletingDebt}
      />

      <DeletePaymentModal
        isOpen={paymentToDelete !== null}
        onClose={() => setPaymentToDelete(null)}
        paymentToDelete={paymentToDelete}
        onConfirm={handleDeletePayment}
        isSubmitting={isDeletingPayment}
      />
    </div>
  );
}

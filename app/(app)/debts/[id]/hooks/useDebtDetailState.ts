/**
 * Debt Detail Page State Management Hook
 * Handles all state for the debt detail page
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useApp } from "@/app/providers/AppProvider";
import { useToast } from "@/components/ui/molecules/Toast";
import { formatForDateTimeInput } from "@/lib/utils/date";
import { DebtItem, DebtPaymentItem, DebtPackage } from "../types";

export function useDebtDetailState() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { user, loadingUser, wallets } = useApp();
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  // Main Data State
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

    if (debt.debt_transactions && debt.debt_transactions.length > 0) {
      setFormPackages(
        debt.debt_transactions.map((t) => ({
          id: t.id,
          totalAmount: t.amount.toString(),
          dueDate: t.due_date ? formatForDateTimeInput(t.due_date) : "",
          createdAt: t.created_at ? formatForDateTimeInput(t.created_at) : formatForDateTimeInput(debt.created_at),
          description: t.description || "",
          proofFiles: null,
          proofPreviews: null,
          existingProofUrls: t.debt_transaction_proofs?.map((p) => p.proof_url) || null,
          shouldDeleteProofUrls: null
        }))
      );
    } else {
      setFormPackages([
        {
          id: Math.random().toString(),
          totalAmount: "",
          dueDate: "",
          createdAt: formatForDateTimeInput(new Date().toISOString()),
          description: "",
          proofFiles: null,
          proofPreviews: null,
          existingProofUrls: null,
          shouldDeleteProofUrls: null
        }
      ]);
    }
    setIsEditModalOpen(true);
  };

  return {
    // State
    debt,
    payments,
    loading,
    user,
    wallets,

    // Modal States
    isEditModalOpen,
    setIsEditModalOpen,
    isPayModalOpen,
    setIsPayModalOpen,
    showDeleteDebtModal,
    setShowDeleteDebtModal,
    paymentToDelete,
    setPaymentToDelete,

    // Form States
    formName,
    setFormName,
    formType,
    setFormType,
    formPackages,
    setFormPackages,
    isSavingDebt,
    setIsSavingDebt,

    // Payment Form States
    payAmount,
    setPayAmount,
    payWalletId,
    setPayWalletId,
    payDate,
    setPayDate,
    payProofFiles,
    setPayProofFiles,
    payProofPreviews,
    setPayProofPreviews,
    isSavingPayment,
    setIsSavingPayment,

    // Deletion States
    isDeletingDebt,
    setIsDeletingDebt,
    isDeletingPayment,
    setIsDeletingPayment,

    // Actions
    loadData,
    openEditModal
  };
}

/**
 * Debt Detail Page Handlers Hook
 * Handles all server operations for the debt detail page
 */

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/molecules/Toast";
import { DebtItem, DebtPackage, DebtPaymentItem } from "../types";
import { formatIDR } from "../../utils";
import { getErrorMessage } from "@/lib/utils/error";
import { saveDebt, deleteDebt, recordPayment, deletePayment } from "../../services";

interface UseDebtDetailHandlersProps {
  debt: DebtItem | null;
  user: any;
  formName: string;
  formType: "owe" | "lend";
  formPackages: DebtPackage[];
  payAmount: string;
  payWalletId: string;
  payDate: string;
  payProofFiles: File[] | null;
  paymentToDelete: DebtPaymentItem | null;
  isSavingDebt: boolean;
  isSavingPayment: boolean;
  isDeletingDebt: boolean;
  isDeletingPayment: boolean;
  setIsSavingDebt: (value: boolean) => void;
  setIsSavingPayment: (value: boolean) => void;
  setIsDeletingDebt: (value: boolean) => void;
  setIsDeletingPayment: (value: boolean) => void;
  setIsEditModalOpen: (value: boolean) => void;
  setIsPayModalOpen: (value: boolean) => void;
  setPaymentToDelete: (value: DebtPaymentItem | null) => void;
  setPayAmount: (value: string) => void;
  setPayProofFiles: (value: File[] | null) => void;
  setPayProofPreviews: (value: string[] | null) => void;
  loadData: () => Promise<void>;
  refreshWallets: () => Promise<void>;
}

export function useDebtDetailHandlers({
  debt,
  user,
  formName,
  formType,
  formPackages,
  payAmount,
  payWalletId,
  payDate,
  payProofFiles,
  paymentToDelete,
  isSavingDebt,
  isSavingPayment,
  isDeletingDebt,
  isDeletingPayment,
  setIsSavingDebt,
  setIsSavingPayment,
  setIsDeletingDebt,
  setIsDeletingPayment,
  setIsEditModalOpen,
  setIsPayModalOpen,
  setPaymentToDelete,
  setPayAmount,
  setPayProofFiles,
  setPayProofPreviews,
  loadData,
  refreshWallets
}: UseDebtDetailHandlersProps) {
  const supabase = createClient();
  const router = useRouter();
  const { success: showSuccessToast, error: showErrorToast } = useToast();

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

    // Check all packages have valid amounts
    for (const pkg of formPackages) {
      const amountNum = parseFloat(pkg.totalAmount);
      if (isNaN(amountNum) || amountNum <= 0) {
        showErrorToast("Jumlah dana harus lebih besar dari 0");
        return;
      }
    }

    if (!user || !debt) return;

    try {
      setIsSavingDebt(true);
      const existingTxnIds = debt.debt_transactions?.map(t => t.id) || [];
      await saveDebt(
        supabase,
        user.id,
        debt.id,
        formName,
        formType,
        formPackages,
        existingTxnIds
      );

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
      await recordPayment(
        supabase,
        user.id,
        debt,
        amountNum,
        payWalletId,
        payDate,
        payProofFiles
      );

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
      await deleteDebt(supabase, debt.id);
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
      await deletePayment(supabase, paymentToDelete.id, paymentToDelete.transaction_id);
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

  return {
    handleSaveDebt,
    handleRecordPayment,
    handleDeleteDebt,
    handleDeletePayment
  };
}

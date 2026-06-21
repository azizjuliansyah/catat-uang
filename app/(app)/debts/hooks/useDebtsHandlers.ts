import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/molecules/Toast";
import { DebtItem, DebtPackage } from "../types";
import { formatIDR } from "../utils";
import { getErrorMessage } from "@/lib/utils/error";
import { fetchDebtsList, saveDebt, deleteDebt, recordPayment } from "../services";

interface UseDebtsHandlersProps {
  user: any;
  refreshWallets: () => Promise<void>;

  // State setters
  setIsAddModalOpen: (open: boolean) => void;
  setIsEditModalOpen: (open: boolean) => void;
  setIsPayModalOpen: (open: boolean) => void;
  setDebtToDelete: (debt: DebtItem | null) => void;
  setPaymentToDelete: (pm: any) => void;
  resetDebtForm: () => void;
  setPayingDebt: (debt: DebtItem | null) => void;
  setPayAmount: (amount: string) => void;

  // Form state - Debt
  formName: string;
  formType: "owe" | "lend";
  formPackages: DebtPackage[];
  editingDebt: DebtItem | null;
  submittingDebt: boolean;
  setSubmittingDebt: (submitting: boolean) => void;

  // Form state - Payment
  payingDebt: DebtItem | null;
  payAmount: string;
  payWalletId: string;
  payDate: string;
  payProofFiles: File[] | null;
  setPayProofFiles: (files: File[] | null) => void;
  payProofPreviews: string[] | null;
  setPayProofPreviews: (previews: string[] | null) => void;
  submittingPayment: boolean;
  setSubmittingPayment: (submitting: boolean) => void;

  // Delete state
  setIsDeleteSubmitting: (submitting: boolean) => void;
  setIsPayDeleteSubmitting: (submitting: boolean) => void;
  setDebts: (debts: DebtItem[]) => void;
}

export function useDebtsHandlers({
  user,
  refreshWallets,

  setIsAddModalOpen,
  setIsEditModalOpen,
  setIsPayModalOpen,
  setDebtToDelete,
  setPaymentToDelete,
  resetDebtForm,
  setPayingDebt,
  setPayAmount,

  formName,
  formType,
  formPackages,
  editingDebt,
  submittingDebt,
  setSubmittingDebt,

  payingDebt,
  payAmount,
  payWalletId,
  payDate,
  payProofFiles,
  setPayProofFiles,
  payProofPreviews,
  setPayProofPreviews,
  submittingPayment,
  setSubmittingPayment,

  setIsDeleteSubmitting,
  setIsPayDeleteSubmitting,
  setDebts
}: UseDebtsHandlersProps) {
  const supabase = createClient();
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  // Fetch all debts
  async function fetchDebts() {
    try {
      const data = await fetchDebtsList(supabase);
      setDebts(data);
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      console.error(err);
      showErrorToast("Gagal memuat daftar hutang/piutang: " + message);
    }
  }

  // ADD / EDIT DEBT
  const handleSaveDebt = async (e: React.FormEvent) => {
    e.preventDefault();

    // Guard: Prevent double submission
    if (submittingDebt) {
      return;
    }

    if (!formName.trim()) {
      showErrorToast("Nama kontak tidak boleh kosong");
      return;
    }

    // Validate all packages
    for (let i = 0; i < formPackages.length; i++) {
      const pkg = formPackages[i];
      const amountNum = parseFloat(pkg.totalAmount);
      if (isNaN(amountNum) || amountNum <= 0) {
        showErrorToast(`Jumlah dana pada baris ke-${i + 1} harus lebih besar dari 0`);
        return;
      }
    }

    if (!user) return;

    try {
      setSubmittingDebt(true);
      const existingTxnIds = editingDebt?.debt_transactions?.map(t => t.id) || [];
      await saveDebt(
        supabase,
        user.id,
        editingDebt?.id || null,
        formName,
        formType,
        formPackages,
        existingTxnIds
      );

      showSuccessToast(
        editingDebt
          ? "Data hutang/piutang berhasil diperbarui!"
          : "Hutang/piutang baru berhasil ditambahkan!"
      );
      
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      resetDebtForm();
      await fetchDebts();
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      showErrorToast("Gagal menyimpan data: " + message);
    } finally {
      setSubmittingDebt(false);
    }
  };

  // DELETE DEBT
  const handleDeleteDebt = async (debtToDelete?: DebtItem | null) => {
    if (!debtToDelete) return;
    try {
      setIsDeleteSubmitting(true);
      await deleteDebt(supabase, debtToDelete.id);
      showSuccessToast("Data hutang/piutang berhasil dihapus");
      setDebtToDelete(null);
      await fetchDebts();
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      showErrorToast("Gagal menghapus catatan: " + message);
    } finally {
      setIsDeleteSubmitting(false);
    }
  };

  // RECORD PAYMENT
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    // Guard: Prevent double submission
    if (submittingPayment) {
      return;
    }

    if (!payingDebt) return;
    const amountNum = parseFloat(payAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      showErrorToast("Jumlah pembayaran harus lebih besar dari 0");
      return;
    }
    if (!payWalletId) {
      showErrorToast("Silakan pilih dompet transaksi");
      return;
    }

    const remaining = payingDebt.total_amount - payingDebt.paid_amount;
    if (amountNum > remaining + 0.01) {
      showErrorToast(`Jumlah pembayaran melebihi sisa tagihan (${formatIDR(remaining)})`);
      return;
    }

    try {
      setSubmittingPayment(true);
      await recordPayment(
        supabase,
        user.id,
        payingDebt,
        amountNum,
        payWalletId,
        payDate,
        payProofFiles
      );

      showSuccessToast("Pembayaran berhasil dicatat!");
      setIsPayModalOpen(false);
      setPayAmount("");
      setPayingDebt(null);
      setPayProofFiles(null);
      setPayProofPreviews(null);
      await fetchDebts();
      await refreshWallets();
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      showErrorToast("Gagal mencatat pembayaran: " + message);
    } finally {
      setSubmittingPayment(false);
    }
  };

  return {
    fetchDebts,
    handleSaveDebt,
    handleDeleteDebt,
    handleRecordPayment
  };
}


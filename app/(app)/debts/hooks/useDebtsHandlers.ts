import { useToast } from "@/components/ui/molecules/Toast";
import { DebtItem, DebtPaymentItem, DebtPackage } from "../types";
import { formatIDR } from "../utils";
import { getErrorMessage } from "@/lib/utils/error";

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
  const supabase = (require("@/lib/supabase/client")).createClient();
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  // Fetch all debts
  async function fetchDebts() {
    try {
      const { data, error } = await supabase
        .from("debts")
        .select(`
          *,
          debt_transactions (
            *,
            debt_transaction_proofs (*)
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDebts(data || []);
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
      
      let parentDebtId = editingDebt?.id || null;

      // 1. Create or Update parent debt row
      if (editingDebt) {
        const { error: updateDebtError } = await supabase
          .from("debts")
          .update({
            name: formName.trim(),
            type: formType,
            updated_at: new Date().toISOString()
          })
          .eq("id", editingDebt.id);
        if (updateDebtError) throw updateDebtError;
      } else {
        const { data: newDebt, error: newDebtError } = await supabase
          .from("debts")
          .insert({
            user_id: user.id,
            name: formName.trim(),
            type: formType,
            total_amount: 0, // Will be calculated by trigger automatically
            paid_amount: 0,
            status: "unpaid"
          })
          .select()
          .single();
        if (newDebtError) throw newDebtError;
        parentDebtId = newDebt.id;
      }

      // 2. If editing, determine transaction deletions
      if (editingDebt) {
        const { data: dbTxns, error: fetchTxnsError } = await supabase
          .from("debt_transactions")
          .select("id")
          .eq("debt_id", editingDebt.id);
        if (fetchTxnsError) throw fetchTxnsError;
        
        const dbTxnIds = dbTxns?.map((t: { id: string }) => t.id) || [];
        const formTxnIds = formPackages.map(pkg => pkg.id);
        
        const txnIdsToDelete = dbTxnIds.filter((id: string) => !formTxnIds.includes(id));
        if (txnIdsToDelete.length > 0) {
          const { error: deleteTxnsError } = await supabase
            .from("debt_transactions")
            .delete()
            .in("id", txnIdsToDelete);
          if (deleteTxnsError) throw deleteTxnsError;
        }
      }

      // 3. Process each transaction in formPackages
      for (const pkg of formPackages) {
        const amountNum = parseFloat(pkg.totalAmount);
        const isoDueDate = pkg.dueDate ? new Date(pkg.dueDate).toISOString() : null;
        
        let transactionId = pkg.id;
        const isNewTxn = !editingDebt || !editingDebt.debt_transactions?.some(t => t.id === pkg.id);

        if (isNewTxn) {
          const { data: newTxn, error: insertTxnError } = await supabase
            .from("debt_transactions")
            .insert({
              debt_id: parentDebtId,
              amount: amountNum,
              due_date: isoDueDate,
              description: pkg.description.trim() || null
            })
            .select()
            .single();
          if (insertTxnError) throw insertTxnError;
          transactionId = newTxn.id;
        } else {
          const { error: updateTxnError } = await supabase
            .from("debt_transactions")
            .update({
              amount: amountNum,
              due_date: isoDueDate,
              description: pkg.description.trim() || null,
              updated_at: new Date().toISOString()
            })
            .eq("id", transactionId);
          if (updateTxnError) throw updateTxnError;
        }

        // Handle transaction proof deletions
        if (pkg.shouldDeleteProofUrls && pkg.shouldDeleteProofUrls.length > 0) {
          const { error: deleteProofError } = await supabase
            .from("debt_transaction_proofs")
            .delete()
            .eq("transaction_id", transactionId)
            .in("proof_url", pkg.shouldDeleteProofUrls);
          if (deleteProofError) throw deleteProofError;
        }

        // Handle transaction proof file uploads
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
      }

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
      const { error } = await supabase
        .from("debts")
        .delete()
        .eq("id", debtToDelete.id);

      if (error) throw error;
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

      const { data: newPayment, error: paymentError } = await supabase
        .from("debt_payments")
        .insert([{
          debt_id: payingDebt.id,
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

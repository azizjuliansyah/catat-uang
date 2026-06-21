/**
 * Edit Transaction Page Handlers Hook
 */

import React from "react";
import { useToast } from "@/components/ui/molecules/Toast";
import { useEditTransactionState } from "./useEditTransactionState";

type EditTransactionState = ReturnType<typeof useEditTransactionState>;

export function useEditTransactionHandlers(state: EditTransactionState) {
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  const {
    id,
    user,
    supabase,
    router,
    refreshWallets,
    refreshPaylaterPlatforms,
    amount,
    type,
    sourceId,
    categoryId,
    description,
    transactionDate,
    existingReceiptUrl,
    setExistingReceiptUrl,
    receiptFile,
    setReceiptFile,
    setReceiptPreview,
    setUploadingReceipt,
    shouldDeleteExistingReceipt,
    setShouldDeleteExistingReceipt,
    setSubmitting,
    setIsDeleteModalOpen,
    setDeleting
  } = state;

  // Handle Receipt Selection
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showErrorToast("Ukuran file nota maksimal adalah 5MB");
      return;
    }

    setReceiptFile(file);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setReceiptPreview(null);
    }
  }

  // Remove Selected Receipt
  function handleRemoveReceipt(fileInputRef: React.RefObject<HTMLInputElement | null>) {
    setReceiptFile(null);
    setReceiptPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  // Form Submit
  async function handleSubmit(e: React.FormEvent, amountInputRef: React.RefObject<HTMLInputElement | null>) {
    e.preventDefault();
    if (!user) return;

    const numericAmount = parseFloat(amount.replace(/[^0-9]/g, ""));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      showErrorToast("Jumlah transaksi harus lebih besar dari 0");
      amountInputRef.current?.focus();
      return;
    }

    if (!sourceId) {
      showErrorToast("Silakan pilih sumber dana");
      return;
    }

    const isWallet = sourceId.startsWith("wallet:");
    const actualWalletId = isWallet ? sourceId.replace("wallet:", "") : null;
    const actualPaylaterId = !isWallet ? sourceId.replace("paylater:", "") : null;

    setSubmitting(true);

    try {
      let finalReceiptUrl = existingReceiptUrl;

      // 1. Check if we should delete existing receipt
      if (shouldDeleteExistingReceipt && existingReceiptUrl) {
        finalReceiptUrl = null;
        try {
          const path = existingReceiptUrl.split("/storage/v1/object/public/receipts/")[1];
          if (path) {
            await supabase.storage.from("receipts").remove([path]);
          }
        } catch (e) {
          console.error("Failed to delete receipt file from storage:", e);
        }
      }

      // 2. Upload new receipt if file exists
      if (receiptFile) {
        setUploadingReceipt(true);
        const fileExt = receiptFile.name.split(".").pop();
        const filePath = `${user.id}/receipt-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("receipts")
          .upload(filePath, receiptFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("receipts")
          .getPublicUrl(filePath);

        finalReceiptUrl = publicUrl;
        setUploadingReceipt(false);
      }

      // 3. Update Transaction
      const { error: updateError } = await supabase
        .from("transactions")
        .update({
          wallet_id: actualWalletId,
          paylater_id: actualPaylaterId,
          category_id: categoryId || null,
          amount: numericAmount,
          type: type,
          description: description.trim() || null,
          transaction_date: new Date(transactionDate).toISOString(),
          receipt_url: finalReceiptUrl,
          updated_at: new Date().toISOString()
        })
        .eq("id", id);

      if (updateError) throw updateError;

      showSuccessToast("Transaksi berhasil diperbarui.");
      await refreshWallets();
      await refreshPaylaterPlatforms();
      router.push("/transactions");
      router.refresh();
    } catch (err: unknown) {
      console.error("Error updating transaction:", err);
      const message = err instanceof Error ? err.message : String(err);
      showErrorToast("Gagal menyimpan perubahan: " + message);
      setSubmitting(false);
    }
  }

  // Handle Delete
  async function handleDeleteTransaction() {
    setDeleting(true);

    try {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);

      if (error) throw error;

      showSuccessToast("Transaksi berhasil dihapus.");
      await refreshWallets();
      await refreshPaylaterPlatforms();
      router.push("/transactions");
      router.refresh();
    } catch (err: unknown) {
      console.error("Error deleting transaction:", err);
      const message = err instanceof Error ? err.message : String(err);
      showErrorToast("Gagal menghapus transaksi: " + message);
      setDeleting(false);
      setIsDeleteModalOpen(false);
    }
  }

  return {
    handleFileChange,
    handleRemoveReceipt,
    handleSubmit,
    handleDeleteTransaction
  };
}
export type EditTransactionHandlers = ReturnType<typeof useEditTransactionHandlers>;

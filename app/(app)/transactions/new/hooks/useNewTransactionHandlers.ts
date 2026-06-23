import { createClient } from "@/lib/supabase/client";
import { formatIDR } from "@/lib/utils/format";
import { NewTransactionState } from "./useNewTransactionState";

export function useNewTransactionHandlers(
  state: NewTransactionState,
  toast: { success: (msg: string) => void; error: (msg: string) => void }
) {
  const supabase = createClient();

  const {
    amount,
    setAmount,
    type,
    sourceId,
    setSourceId,
    categoryId,
    description,
    transactionDate,
    receiptFile,
    setReceiptFile,
    setReceiptPreview,
    setUploadingReceipt,
    setSubmitting,
    user,
    refreshWallets,
    refreshPaylaterPlatforms,
    router,
    fileInputRef,
    amountInputRef
  } = state;

  // Handle Receipt Selection
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file nota maksimal adalah 5MB");
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
  function handleRemoveReceipt() {
    setReceiptFile(null);
    setReceiptPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  // Handle form submit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    const numericAmount = parseFloat(amount.replace(/[^0-9]/g, ""));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast.error("Jumlah transaksi harus lebih besar dari 0");
      amountInputRef.current?.focus();
      return;
    }

    if (!sourceId) {
      toast.error("Silakan pilih sumber dana");
      return;
    }

    const isWallet = sourceId.startsWith("wallet:");
    const actualWalletId = isWallet ? sourceId.replace("wallet:", "") : null;
    const actualPaylaterId = !isWallet ? sourceId.replace("paylater:", "") : null;

    setSubmitting(true);

    try {
      let finalReceiptUrl = null;

      // 1. Upload receipt if file exists
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

      // 2. Create Transaction
      const { error: insertError } = await supabase
        .from("transactions")
        .insert({
          user_id: user.id,
          wallet_id: actualWalletId,
          paylater_id: actualPaylaterId,
          category_id: categoryId || null,
          amount: numericAmount,
          type: type,
          description: description.trim() || null,
          transaction_date: new Date(transactionDate).toISOString(),
          receipt_url: finalReceiptUrl
        });

      if (insertError) throw insertError;

      toast.success("Transaksi baru berhasil disimpan.");
      await refreshWallets();
      await refreshPaylaterPlatforms();
      router.push("/transactions");
    } catch (err: unknown) {
      console.error("Error creating transaction:", err);
      const message = err instanceof Error ? err.message : String(err);
      toast.error("Gagal menyimpan transaksi: " + message);
      setSubmitting(false);
      setUploadingReceipt(false);
    }
  }

  const getFormattedPreview = () => {
    const rawVal = amount.replace(/[^0-9]/g, "");
    if (!rawVal) return "Rp 0";
    const num = parseInt(rawVal);
    return formatIDR(num);
  };

  return {
    handleFileChange,
    handleRemoveReceipt,
    handleSubmit,
    getFormattedPreview
  };
}

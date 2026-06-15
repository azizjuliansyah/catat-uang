"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useApp } from "@/app/providers/AppProvider";
import { useToast } from "@/components/ui/molecules/Toast";
import { Modal } from "@/components/ui/organisms/Modal";
import { Button } from "@/components/ui/atoms/Button";
import { TabButton } from "@/components/ui/molecules/TabButton";
import { ArrowLeft, Calendar, Wallet as WalletIcon, FileText, Trash2, CreditCard } from "lucide-react";
import { CategoryGridSelector } from "../components/CategoryGridSelector";
import { ReceiptManager } from "../components/ReceiptManager";
import { formatForDateTimeInput } from "@/lib/utils/date";
import { CustomSelect } from "@/components/ui/atoms/CustomSelect";

export default function EditTransactionPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);

  const { success: showSuccessToast, error: showErrorToast } = useToast();
  const {
    user,
    loadingUser,
    wallets,
    loadingWallets,
    categories,
    loadingCategories,
    paylaterPlatforms,
    loadingPaylaterPlatforms,
    refreshWallets,
    refreshPaylaterPlatforms
  } = useApp();

  const [loadingTx, setLoadingTx] = useState(true);
  const loading = loadingUser || loadingWallets || loadingCategories || loadingPaylaterPlatforms || loadingTx;

  // Form States
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [sourceId, setSourceId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [transactionDate, setTransactionDate] = useState("");
  const [existingReceiptUrl, setExistingReceiptUrl] = useState<string | null>(null);

  // Receipt Upload States
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [shouldDeleteExistingReceipt, setShouldDeleteExistingReceipt] = useState(false);

  // UI States
  const [submitting, setSubmitting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadTransaction() {
      if (!id || !user) return;
      setLoadingTx(true);
      try {
        const { data: tx, error: txError } = await supabase
          .from("transactions")
          .select("*")
          .eq("id", id)
          .eq("user_id", user.id)
          .single();

        if (txError || !tx) {
          showErrorToast("Transaksi tidak ditemukan.");
          return;
        }

        setAmount(tx.amount.toString());
        setType(tx.type);
        if (tx.wallet_id) {
          setSourceId(`wallet:${tx.wallet_id}`);
        } else if (tx.paylater_id) {
          setSourceId(`paylater:${tx.paylater_id}`);
        } else {
          setSourceId("");
        }
        setCategoryId(tx.category_id || "");
        setDescription(tx.description || "");
        setTransactionDate(formatForDateTimeInput(tx.transaction_date));
        setExistingReceiptUrl(tx.receipt_url);
      } catch (err: unknown) {
        console.error("Error loading transaction:", err);
        showErrorToast("Gagal mengambil data transaksi.");
      } finally {
        setLoadingTx(false);
      }
    }

    if (!loadingUser) {
      if (!user) {
        router.push("/login");
      } else {
        loadTransaction();
      }
    }
  }, [supabase, user, loadingUser, id, router, showErrorToast]);

  // Keep category in sync with type
  useEffect(() => {
    const typeCategories = categories.filter((c) => c.type === type);
    if (typeCategories.length > 0) {
      const currentCat = categories.find((c) => c.id === categoryId);
      if (!currentCat || currentCat.type !== type) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCategoryId(typeCategories[0].id);
      }
    } else {
      setCategoryId("");
    }
  }, [type, categories, categoryId]);

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
  function handleRemoveReceipt() {
    setReceiptFile(null);
    setReceiptPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  // Form Submit
  async function handleSubmit(e: React.FormEvent) {
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

  const getFormattedPreview = () => {
    const rawVal = amount.replace(/[^0-9]/g, "");
    if (!rawVal) return "Rp 0";
    const num = parseInt(rawVal);
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
        <div className="h-6 w-32 bg-border/40 rounded" />
        <div className="h-96 bg-surface-card border border-border rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 font-sans">
      {/* Back Link */}
      <div>
        <Link
          href="/transactions"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar Transaksi
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary font-display">
            Sunting Catatan Transaksi
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Ubah data nominal, kategori, dompet, deskripsi, atau lampiran nota transaksi.
          </p>
        </div>

        <Button
          variant="destructive"
          size="sm"
          onClick={() => setIsDeleteModalOpen(true)}
          className="self-stretch sm:self-auto"
        >
          <Trash2 className="w-4 h-4 mr-1.5" />
          Hapus Transaksi
        </Button>
      </div>

      {/* Form Card */}
      <div className="bg-surface-card border border-border rounded-2xl p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Segment Type Selector */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Jenis Transaksi</label>
            <div className="grid grid-cols-2 gap-2 bg-surface-hover/30 border border-border p-1 rounded-xl">
              <TabButton
                isActive={type === "expense"}
                onClick={() => setType("expense")}
                className={`py-2 text-xs rounded-lg ${type === "expense" ? "bg-expense/10 text-expense" : ""}`}
              >
                Pengeluaran
              </TabButton>
              <TabButton
                isActive={type === "income"}
                onClick={() => setType("income")}
                className={`py-2 text-xs rounded-lg ${type === "income" ? "bg-income/10 text-income" : ""}`}
              >
                Pemasukan
              </TabButton>
            </div>
          </div>

          {/* Amount Field */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
              Jumlah Uang (Rupiah)
              <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm font-bold text-text-secondary select-none">
                Rp.
              </span>
              <input
                ref={amountInputRef}
                type="text"
                value={amount ? parseInt(amount).toLocaleString("id-ID") : ""}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, "");
                  setAmount(raw);
                }}
                placeholder="0"
                className="w-full pl-11 pr-4 py-3 bg-surface-input border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-text-primary text-base font-bold font-mono outline-none transition-all focus-glow"
                required
              />
            </div>
            <p className="text-xs text-text-muted mt-1.5">
              Terformat: {getFormattedPreview()}
            </p>
          </div>

          {/* Date and Wallet Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Transaction Date */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                Tanggal Transaksi
                <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="datetime-local"
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-surface-input border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-text-primary text-xs outline-none transition-all cursor-pointer focus-glow"
                  required
                />
              </div>
            </div>

            {/* Source/Target Wallet */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                Sumber Dana
                <span className="text-danger">*</span>
              </label>
              <CustomSelect
                value={sourceId}
                onChange={setSourceId}
                options={[
                  { value: "header-wallets", label: "Dompet / Rekening", disabled: true },
                  ...wallets.filter((w) => !w.is_archived).map((w) => ({
                    value: `wallet:${w.id}`,
                    label: `${w.name} (${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(w.balance)})`,
                    icon: <WalletIcon className="w-4 h-4 text-text-secondary" />
                  })),
                  ...(paylaterPlatforms.filter((p) => !p.is_archived).length > 0
                    ? [
                        { value: "header-paylater", label: "Paylater (Kredit)", disabled: true },
                        ...paylaterPlatforms.filter((p) => !p.is_archived).map((p) => ({
                          value: `paylater:${p.id}`,
                          label: `${p.name} (Outstanding: ${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(p.balance)})`,
                          icon: <CreditCard className="w-4 h-4 text-text-secondary" />
                        }))
                      ]
                    : [])
                ]}
                placeholder="Pilih Sumber Dana"
              />
            </div>
          </div>

          {/* Category Selection */}
          <CategoryGridSelector
            categories={categories}
            categoryId={categoryId}
            setCategoryId={setCategoryId}
            type={type}
          />

          {/* Description */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-secondary">Deskripsi / Catatan (Opsional)</label>
            <div className="relative">
              <FileText className="w-4 h-4 text-text-secondary absolute left-3 top-3 pointer-events-none" />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Contoh: Beli makan siang nasi goreng kambing"
                rows={3}
                className="w-full pl-9 pr-4 py-2.5 bg-surface-input border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-text-primary text-xs outline-none transition-all resize-none focus-glow"
              />
            </div>
          </div>

          {/* Receipt Upload & Management */}
          <ReceiptManager
            receiptFile={receiptFile}
            receiptPreview={receiptPreview}
            onFileChange={handleFileChange}
            onRemove={handleRemoveReceipt}
            existingReceiptUrl={existingReceiptUrl}
            shouldDeleteExistingReceipt={shouldDeleteExistingReceipt}
            setShouldDeleteExistingReceipt={setShouldDeleteExistingReceipt}
            fileInputRef={fileInputRef}
          />

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <Button
              variant="ghost"
              onClick={() => router.push("/transactions")}
              className="px-5"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={submitting || uploadingReceipt}
              className="px-6"
            >
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </div>

      {/* Delete Transaction Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Hapus Catatan Transaksi?"
        isDestructive
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteTransaction}
              isLoading={deleting}
              className="flex-1"
            >
              Hapus
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-danger/10 text-danger mb-2">
            <Trash2 className="w-6 h-6" />
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Apakah Anda yakin ingin menghapus transaksi ini secara permanen?
            <br />
            Saldo dompet Anda akan disesuaikan kembali secara otomatis.
          </p>
        </div>
      </Modal>
    </div>
  );
}

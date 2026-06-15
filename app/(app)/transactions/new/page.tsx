"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useApp } from "@/app/providers/AppProvider";
import { useToast } from "@/components/ui/molecules/Toast";
import { Button } from "@/components/ui/atoms/Button";
import { TabButton } from "@/components/ui/molecules/TabButton";
import { ArrowLeft, Calendar, Wallet as WalletIcon, CreditCard, FileText } from "lucide-react";
import { CategoryGridSelector } from "../components/CategoryGridSelector";
import { ReceiptManager } from "../components/ReceiptManager";
import { getNowDateTimeString } from "@/lib/utils/date";
import CustomSelect from "@/components/ui/atoms/CustomSelect";

export default function NewTransactionPage() {
  const supabase = createClient();
  const router = useRouter();
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

  const loading = loadingUser || loadingWallets || loadingCategories || loadingPaylaterPlatforms;

  // Form States
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [sourceId, setSourceId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [transactionDate, setTransactionDate] = useState(() => {
    return getNowDateTimeString(); // YYYY-MM-DDTHH:MM local
  });

  // Receipt Upload States
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loadingUser && !user) {
      router.push("/login");
    }
  }, [user, loadingUser, router]);

  /* eslint-disable react-hooks/set-state-in-effect */
  // Pre-select default wallet
  useEffect(() => {
    if (!loadingWallets && wallets.length > 0 && !sourceId) {
      const activeWallets = wallets.filter((w) => !w.is_archived);
      const defaultWallet = activeWallets.find((w) => w.is_default);
      if (defaultWallet) {
        setSourceId(`wallet:${defaultWallet.id}`);
      } else if (activeWallets.length > 0) {
        setSourceId(`wallet:${activeWallets[0].id}`);
      }
    }
  }, [wallets, loadingWallets, sourceId]);

  // Pre-select category when type changes
  useEffect(() => {
    const typeCategories = categories.filter((c) => c.type === type);
    if (typeCategories.length > 0) {
      const currentCat = categories.find((c) => c.id === categoryId);
      if (!currentCat || currentCat.type !== type) {
        setCategoryId(typeCategories[0].id);
      }
    } else {
      setCategoryId("");
    }
  }, [type, categories, categoryId]);
  /* eslint-enable react-hooks/set-state-in-effect */

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

  // Handle form submit
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

      showSuccessToast("Transaksi baru berhasil disimpan.");
      await refreshWallets();
      await refreshPaylaterPlatforms();
      router.push("/transactions");
    } catch (err: unknown) {
      console.error("Error creating transaction:", err);
      const message = err instanceof Error ? err.message : String(err);
      showErrorToast("Gagal menyimpan transaksi: " + message);
      setSubmitting(false);
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
      {/* Back Button */}
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary font-display">
          Catat Transaksi Baru
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Masukkan detail pengeluaran atau pemasukan baru beserta lampiran nota jika ada.
        </p>
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

          {/* Receipt Upload */}
          <ReceiptManager
            receiptFile={receiptFile}
            receiptPreview={receiptPreview}
            onFileChange={handleFileChange}
            onRemove={handleRemoveReceipt}
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
              Simpan Transaksi
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

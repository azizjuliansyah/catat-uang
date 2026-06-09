"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getIconComponent } from "@/lib/utils/icons";
import { useApp } from "@/app/providers/AppProvider";
import {
  ArrowLeft,
  Calendar,
  Wallet as WalletIcon,
  Tag,
  FileText,
  UploadCloud,
  X,
  AlertCircle,
  Check,
  Image as ImageIcon
} from "lucide-react";

interface Wallet {
  id: string;
  name: string;
  balance: number;
}

interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  icon: string;
  color: string;
}

export default function NewTransactionPage() {
  const supabase = createClient();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    user,
    loadingUser,
    wallets,
    loadingWallets,
    categories,
    loadingCategories,
    refreshWallets
  } = useApp();

  const loading = loadingUser || loadingWallets || loadingCategories;

  // Form States
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [walletId, setWalletId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [transactionDate, setTransactionDate] = useState(() => {
    return new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  });

  // Receipt Upload States
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  // UI States
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loadingUser && !user) {
      router.push("/login");
    }
  }, [user, loadingUser, router]);

  // Pre-select default wallet if any or first wallet
  useEffect(() => {
    if (!loadingWallets && wallets.length > 0 && !walletId) {
      const activeWallets = wallets.filter((w) => !w.is_archived);
      const defaultWallet = activeWallets.find((w) => w.is_default);
      if (defaultWallet) {
        setWalletId(defaultWallet.id);
      } else if (activeWallets.length > 0) {
        setWalletId(activeWallets[0].id);
      }
    }
  }, [wallets, loadingWallets, walletId]);

  // Pre-select category when type or category list changes
  useEffect(() => {
    const typeCategories = categories.filter((c) => c.type === type);
    if (typeCategories.length > 0) {
      // Keep selected category if it matches type, else switch to first category of type
      const currentCat = categories.find((c) => c.id === categoryId);
      if (!currentCat || currentCat.type !== type) {
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
      setErrorMsg("Ukuran file nota maksimal adalah 5MB");
      return;
    }

    setReceiptFile(file);
    setErrorMsg(null);

    // Create image preview if image
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
    setErrorMsg(null);

    const numericAmount = parseFloat(amount.replace(/[^0-9]/g, ""));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMsg("Jumlah transaksi harus lebih besar dari 0");
      return;
    }

    if (!walletId) {
      setErrorMsg("Silakan pilih dompet");
      return;
    }

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
          wallet_id: walletId,
          category_id: categoryId || null,
          amount: numericAmount,
          type: type,
          description: description.trim() || null,
          transaction_date: transactionDate,
          receipt_url: finalReceiptUrl
        });

      if (insertError) throw insertError;

      await refreshWallets();
      router.push("/transactions");
    } catch (err: any) {
      console.error("Error creating transaction:", err);
      setErrorMsg("Gagal menyimpan transaksi: " + err.message);
      setSubmitting(false);
    }
  }

  // Helper to format currency preview in rupiah
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

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const clean = e.target.value.replace(/[^0-9]/g, "");
    setAmount(clean);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
        <div className="h-6 w-32 bg-surface-card rounded" />
        <div className="h-96 bg-surface-card border border-border rounded-xl" />
      </div>
    );
  }

  const filteredCategories = categories.filter((c) => c.type === type);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
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
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Catat Transaksi Baru
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Masukkan detail pengeluaran atau pemasukan baru beserta lampiran nota jika ada.
        </p>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded-lg flex items-start gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span className="text-xs font-medium">{errorMsg}</span>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-surface-card border border-border rounded-xl p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Segment Type Selector */}
          <div className="grid grid-cols-2 gap-2 bg-surface-input border border-border p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setType("expense")}
              className={`py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                type === "expense"
                  ? "bg-expense/15 text-expense border border-expense/20 font-bold"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => setType("income")}
              className={`py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                type === "income"
                  ? "bg-income/15 text-income border border-income/20 font-bold"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Pemasukan
            </button>
          </div>

          {/* Amount Field */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-secondary block">Jumlah Uang (Rupiah)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm font-bold text-text-secondary">
                Rp
              </span>
              <input
                type="text"
                value={amount ? parseInt(amount).toLocaleString("id-ID") : ""}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, "");
                  setAmount(raw);
                }}
                placeholder="0"
                className="w-full pl-10 pr-4 py-3 bg-surface-input border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-text-primary text-base font-bold font-mono outline-none transition-all"
                required
              />
            </div>
            <p className="text-xxs text-text-secondary italic">
              Terformat: <span className="font-semibold text-text-primary">{getFormattedPreview()}</span>
            </p>
          </div>

          {/* Date and Wallet Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Transaction Date */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-secondary block">Tanggal</label>
              <div className="relative">
                <Calendar className="w-5 h-5 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-input border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-text-primary text-sm outline-none transition-all cursor-pointer"
                  required
                />
              </div>
            </div>

            {/* Source/Target Wallet */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-secondary block">Sumber Dompet</label>
              <div className="relative">
                <WalletIcon className="w-5 h-5 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={walletId}
                  onChange={(e) => setWalletId(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-input border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-text-primary text-sm outline-none transition-all cursor-pointer"
                  required
                >
                  <option value="" disabled>Pilih Dompet</option>
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(w.balance)})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-secondary block">Kategori</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-surface-input border border-border p-3 rounded-lg max-h-48 overflow-y-auto">
              {filteredCategories.map((cat) => {
                const IconComponent = getIconComponent(cat.icon);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`p-3 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all border text-center cursor-pointer ${
                      categoryId === cat.id
                        ? "border-primary bg-primary/10 text-primary font-semibold"
                        : "border-transparent text-text-secondary hover:bg-surface-hover"
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: cat.color }}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span className="text-xxs truncate w-full">{cat.name}</span>
                  </button>
                );
              })}

              {filteredCategories.length === 0 && (
                <div className="col-span-full py-4 text-center text-xs text-text-secondary">
                  Belum ada kategori untuk jenis transaksi ini. Buat kategori baru di Pengaturan.
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-secondary block">Deskripsi / Catatan (Opsional)</label>
            <div className="relative">
              <FileText className="w-5 h-5 text-text-secondary absolute left-3 top-3 pointer-events-none" />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Contoh: Beli makan siang nasi goreng kambing"
                rows={3}
                className="w-full pl-10 pr-4 py-2.5 bg-surface-input border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-text-primary text-sm outline-none transition-all resize-none"
              />
            </div>
          </div>

          {/* Receipt Upload */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-secondary block">Lampirkan Nota (Opsional)</label>
            
            {receiptFile ? (
              <div className="bg-surface-input border border-border rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {receiptPreview ? (
                    <img src={receiptPreview} alt="Receipt preview" className="w-12 h-12 rounded object-cover border border-border" />
                  ) : (
                    <div className="w-12 h-12 rounded bg-surface-card border border-border flex items-center justify-center text-text-secondary">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-text-primary truncate max-w-[180px]">
                      {receiptFile.name}
                    </p>
                    <p className="text-xxs text-text-secondary">
                      {(receiptFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveReceipt}
                  className="p-1.5 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-md transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="bg-surface-input border border-border border-dashed hover:border-border-strong rounded-xl p-6 text-center cursor-pointer hover:bg-surface-hover transition-colors flex flex-col items-center justify-center gap-2"
              >
                <div className="w-10 h-10 rounded-full bg-surface-card border border-border flex items-center justify-center text-text-secondary">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-text-primary">
                    Pilih file nota pembayaran
                  </p>
                  <p className="text-xxs text-text-secondary mt-0.5">
                    Klik untuk memilih file foto/nota. Maksimal 5MB.
                  </p>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <Link
              href="/transactions"
              className="px-4 py-2.5 bg-surface-hover border border-border hover:border-border-strong text-text-secondary text-sm font-semibold rounded-lg transition-colors cursor-pointer text-center"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              {submitting ? "Menyimpan..." : "Simpan Transaksi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

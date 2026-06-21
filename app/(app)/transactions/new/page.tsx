"use client";

import Link from "next/link";
import { useToast } from "@/components/ui/molecules/Toast";
import { Button } from "@/components/ui/atoms/Button";
import { TabButton } from "@/components/ui/molecules/TabButton";
import { ArrowLeft, Calendar, Wallet as WalletIcon, CreditCard, FileText } from "lucide-react";
import { CategoryGridSelector } from "../components/CategoryGridSelector";
import { ReceiptManager } from "../components/ReceiptManager";
import CustomSelect from "@/components/ui/atoms/CustomSelect";

import { useNewTransactionState } from "./hooks/useNewTransactionState";
import { useNewTransactionHandlers } from "./hooks/useNewTransactionHandlers";

export default function NewTransactionPage() {
  const toast = useToast();
  const state = useNewTransactionState();
  const handlers = useNewTransactionHandlers(state, toast);

  const {
    fileInputRef,
    amountInputRef,
    wallets,
    categories,
    paylaterPlatforms,
    loading,
    amount,
    setAmount,
    type,
    setType,
    sourceId,
    setSourceId,
    categoryId,
    setCategoryId,
    description,
    setDescription,
    transactionDate,
    setTransactionDate,
    receiptFile,
    receiptPreview,
    uploadingReceipt,
    submitting,
    router
  } = state;

  const {
    handleFileChange,
    handleRemoveReceipt,
    handleSubmit,
    getFormattedPreview
  } = handlers;

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
                  className="w-full pl-9 pr-3 py-2 bg-surface-input border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-text-primary text-xs outline-none transition-all cursor-pointer focus-glow min-h-[44px]"
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

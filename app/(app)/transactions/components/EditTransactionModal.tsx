// app/(app)/transactions/components/EditTransactionModal.tsx
"use client";

import { Modal } from "@/components/ui/organisms/Modal";
import { ModalFooter } from "@/components/ui/molecules/ModalFooter";
import { TransactionTypeSelector } from "@/components/ui/molecules/TransactionTypeSelector";
import { CategoryGridSelector } from "./CategoryGridSelector";
import { ReceiptManager } from "./ReceiptManager";
import { FormField } from "@/components/ui/molecules/FormField";
import { CurrencyInput } from "@/components/ui/atoms/CurrencyInput";
import { DatetimeInput } from "@/components/ui/atoms/DatetimeInput";
import { Textarea } from "@/components/ui/atoms/Textarea";
import CustomSelect from "@/components/ui/atoms/CustomSelect";
import { formatIDR } from "@/lib/utils/format";
import { useTransactionFormState } from "../hooks/useTransactionFormState";
import { useTransactionFormHandlers } from "../hooks/useTransactionFormHandlers";
import { useToast } from "@/components/ui/molecules/Toast";

interface Transaction {
  id: string;
  amount: number;
  type: "income" | "expense";
  wallet_id: string | null;
  paylater_id: string | null;
  category_id: string | null;
  description: string | null;
  transaction_date: string;
  receipt_url: string | null;
}

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transaction: Transaction | null;
}

export function EditTransactionModal({
  isOpen,
  onClose,
  onSuccess,
  transaction
}: EditTransactionModalProps) {
  const toast = useToast();
  const state = useTransactionFormState("edit", transaction || undefined);
  const handlers = useTransactionFormHandlers(state, toast, onSuccess);

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
    submitting
  } = state;

  const {
    handleFileChange,
    handleRemoveReceipt,
    handleSubmit,
    getFormattedPreview
  } = handlers;

  if (loading || !transaction) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Edit Transaksi">
        <div className="space-y-6 animate-pulse">
          <div className="h-6 w-32 bg-border/40 rounded" />
          <div className="h-96 bg-surface-hover rounded" />
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Transaksi"
      onSubmit={handleSubmit}
      className="max-w-2xl"
      footer={
        <ModalFooter
          onCancel={onClose}
          onSubmit={(e) => {
            e?.preventDefault();
            handleSubmit(e as React.FormEvent);
          }}
          isSubmitting={submitting || uploadingReceipt}
          submitText="Simpan Perubahan"
        />
      }
    >
      <div className="space-y-5">
        {/* Segment Type Selector */}
        <TransactionTypeSelector
          value={type}
          onChange={setType}
        />

        {/* Amount Field */}
        <FormField
          label="Jumlah Uang (Rupiah)"
          required
          helperText={`Terformat: ${getFormattedPreview()}`}
        >
          <CurrencyInput
            ref={amountInputRef}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            size="md"
          />
        </FormField>

        {/* Date and Wallet Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Transaction Date */}
          <FormField
            label="Tanggal Transaksi"
            required
          >
            <DatetimeInput
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              size="md"
            />
          </FormField>

          {/* Source/Target Wallet */}
          <FormField
            label={type === "income" ? "Dompet Tujuan" : "Sumber Dana"}
            required
          >
            <CustomSelect
              value={sourceId}
              onChange={setSourceId}
              options={[
                { value: "header-wallets", label: "Dompet / Rekening", disabled: true },
                ...wallets.filter((w) => !w.is_archived).map((w) => ({
                  value: `wallet:${w.id}`,
                  label: `${w.name} (${formatIDR(w.balance)})`
                })),
                ...(paylaterPlatforms.filter((p) => !p.is_archived).length > 0
                  ? [
                    { value: "header-paylater", label: "Paylater (Kredit)", disabled: true },
                    ...paylaterPlatforms.filter((p) => !p.is_archived).map((p) => ({
                      value: `paylater:${p.id}`,
                      label: `${p.name} (Outstanding: ${formatIDR(p.balance)})`
                    }))
                  ]
                  : [])
              ]}
              placeholder={type === "income" ? "Pilih Dompet Tujuan" : "Pilih Sumber Dana"}
            />
          </FormField>
        </div>

        {/* Category Selection */}
        <CategoryGridSelector
          categories={categories}
          categoryId={categoryId}
          setCategoryId={setCategoryId}
          type={type}
        />

        {/* Description */}
        <FormField
          label="Deskripsi / Catatan"
          helperText="Opsional"
        >
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Contoh: Beli makan siang nasi goreng kambing"
            rows={3}
            resize="none"
          />
        </FormField>

        {/* Receipt Upload */}
        <ReceiptManager
          receiptFile={receiptFile}
          receiptPreview={receiptPreview}
          onFileChange={handleFileChange}
          onRemove={handleRemoveReceipt}
          fileInputRef={fileInputRef}
          type={type}
        />
      </div>
    </Modal>
  );
}

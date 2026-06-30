"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useApp, TransactionTemplateItem } from "@/app/providers/AppProvider";
import { useToast } from "@/components/ui/molecules/Toast";
import { FormField } from "@/components/ui/molecules/FormField";
import { Input } from "@/components/ui/atoms/Input";
import { CurrencyInput } from "@/components/ui/atoms/CurrencyInput";
import { Textarea } from "@/components/ui/atoms/Textarea";
import { Modal } from "@/components/ui/organisms/Modal";
import { ModalFooter } from "@/components/ui/molecules/ModalFooter";
import { TransactionTypeSelector } from "@/components/ui/molecules/TransactionTypeSelector";
import CustomSelect from "@/components/ui/atoms/CustomSelect";
import { CategoryGridSelector } from "@/app/(app)/transactions/components/CategoryGridSelector";
import { createTemplate, updateTemplate } from "../../services";
import { getErrorMessage, formatIDR } from "../../utils";

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTemplate: TransactionTemplateItem | null;
  onSaveSuccess: () => void;
}

export function TemplateModal({
  isOpen,
  onClose,
  editingTemplate,
  onSaveSuccess
}: TemplateModalProps) {
  const supabase = createClient();
  const { user, wallets, paylaterPlatforms, categories } = useApp();
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  const [name, setName] = useState("");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [amount, setAmount] = useState("");
  const [sourceId, setSourceId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Load editing template data or reset on open
  useEffect(() => {
    if (isOpen) {
      if (editingTemplate) {
        setName(editingTemplate.name);
        setType(editingTemplate.type);
        setAmount(editingTemplate.amount.toString());
        setCategoryId(editingTemplate.category_id || "");
        setDescription(editingTemplate.description || "");
        if (editingTemplate.wallet_id) {
          setSourceId(`wallet:${editingTemplate.wallet_id}`);
        } else if (editingTemplate.paylater_id) {
          setSourceId(`paylater:${editingTemplate.paylater_id}`);
        } else {
          setSourceId("");
        }
      } else {
        setName("");
        setType("expense");
        setAmount("");
        setCategoryId("");
        setDescription("");
        // Set default wallet if available
        const defaultWallet = wallets.find((w) => w.is_default && !w.is_archived) || wallets.find((w) => !w.is_archived);
        setSourceId(defaultWallet ? `wallet:${defaultWallet.id}` : "");
      }
    }
  }, [isOpen, editingTemplate, wallets]);

  // Adjust source of funds if type changes to income and paylater was selected
  useEffect(() => {
    if (type === "income" && sourceId.startsWith("paylater:")) {
      const defaultWallet = wallets.find((w) => w.is_default && !w.is_archived) || wallets.find((w) => !w.is_archived);
      setSourceId(defaultWallet ? `wallet:${defaultWallet.id}` : "");
    }
  }, [type, sourceId, wallets]);

  // Format currency preview
  const getFormattedPreview = () => {
    if (!amount) return "Rp. 0";
    const val = parseFloat(amount);
    if (isNaN(val)) return "Rp. 0";
    return formatIDR(val);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    if (!name.trim()) {
      showErrorToast("Nama template wajib diisi");
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      showErrorToast("Jumlah uang harus lebih besar dari 0");
      return;
    }

    if (!sourceId) {
      showErrorToast("Sumber dana wajib dipilih");
      return;
    }

    if (!categoryId) {
      showErrorToast("Kategori wajib dipilih");
      return;
    }

    setSubmitting(true);
    try {
      const isWallet = sourceId.startsWith("wallet:");
      const cleanedId = sourceId.split(":")[1];

      if (editingTemplate) {
        await updateTemplate(supabase, editingTemplate.id, {
          name: name.trim(),
          type,
          amount: parsedAmount,
          category_id: categoryId,
          wallet_id: isWallet ? cleanedId : null,
          paylater_id: !isWallet ? cleanedId : null,
          description: description.trim() || null,
          updated_at: new Date().toISOString(),
        });
        showSuccessToast(`Template "${name}" berhasil diperbarui!`);
      } else {
        await createTemplate(supabase, user.id, {
          name: name.trim(),
          type,
          amount: parsedAmount,
          category_id: categoryId,
          wallet_id: isWallet ? cleanedId : null,
          paylater_id: !isWallet ? cleanedId : null,
          description: description.trim() || null,
        });
        showSuccessToast(`Template "${name}" berhasil ditambahkan!`);
      }

      onSaveSuccess();
      onClose();
    } catch (err: unknown) {
      console.error("Error saving template:", err);
      showErrorToast("Gagal menyimpan template: " + getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  // Populate source options
  const sourceOptions = [
    { value: "header-wallets", label: "Dompet / Rekening", disabled: true },
    ...wallets.filter((w) => !w.is_archived).map((w) => ({
      value: `wallet:${w.id}`,
      label: `${w.name} (${formatIDR(w.balance)})`
    })),
    ...(type === "expense" && paylaterPlatforms.filter((p) => !p.is_archived).length > 0
      ? [
        { value: "header-paylater", label: "Paylater (Kredit)", disabled: true },
        ...paylaterPlatforms.filter((p) => !p.is_archived).map((p) => ({
          value: `paylater:${p.id}`,
          label: `${p.name} (Outstanding: ${formatIDR(p.balance)})`
        }))
      ]
      : [])
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingTemplate ? "Edit Template Transaksi" : "Buat Template Transaksi Baru"}
      onSubmit={handleSubmit}
      footer={
        <ModalFooter
          onCancel={onClose}
          isSubmitting={submitting}
          submitText="Simpan Template"
        />
      }
    >
      <div className="space-y-4">
        {/* Template Name */}
        <FormField
          label="Nama Template"
          required
        >
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Kopi Harian, Bayar Kos, Uang Jajan"
          />
        </FormField>

        {/* Transaction Type */}
        <TransactionTypeSelector
          value={type}
          onChange={(newType) => {
            setType(newType);
            setCategoryId("");
          }}
        />

        {/* Amount */}
        <FormField
          label="Jumlah Uang"
          required
          helperText={`Terformat: ${getFormattedPreview()}`}
        >
          <CurrencyInput
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
          />
        </FormField>

        {/* Source of Funds */}
        <FormField
          label={type === "income" ? "Dompet Tujuan" : "Sumber Dana"}
          required
        >
          <CustomSelect
            value={sourceId}
            onChange={setSourceId}
            options={sourceOptions}
            placeholder={type === "income" ? "Pilih Dompet Tujuan" : "Pilih Sumber Dana"}
          />
        </FormField>

        {/* Category Grid */}
        <CategoryGridSelector
          categories={categories}
          categoryId={categoryId}
          setCategoryId={setCategoryId}
          type={type}
        />

        {/* Description */}
        <FormField label="Deskripsi / Catatan (Opsional)">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Contoh: Catatan tambahan untuk template ini..."
            rows={3}
          />
        </FormField>
      </div>
    </Modal>
  );
}

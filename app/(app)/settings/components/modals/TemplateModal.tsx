"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useApp, TransactionTemplateItem } from "@/app/providers/AppProvider";
import { useToast } from "@/components/ui/molecules/Toast";
import { FormField } from "@/components/ui/molecules/FormField";
import { Modal } from "@/components/ui/organisms/Modal";
import { Button } from "@/components/ui/atoms/Button";
import { TabButton } from "@/components/ui/molecules/TabButton";
import CustomSelect from "@/components/ui/atoms/CustomSelect";
import { CategoryGridSelector } from "@/app/(app)/transactions/components/CategoryGridSelector";
import { Wallet as WalletIcon, CreditCard, FileText } from "lucide-react";

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

  function getErrorMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    return String(err);
  }

  // Format currency preview
  const getFormattedPreview = () => {
    if (!amount) return "Rp. 0";
    const val = parseFloat(amount);
    if (isNaN(val)) return "Rp. 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(val);
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

      const payload = {
        user_id: user.id,
        name: name.trim(),
        type,
        amount: parsedAmount,
        category_id: categoryId,
        wallet_id: isWallet ? cleanedId : null,
        paylater_id: !isWallet ? cleanedId : null,
        description: description.trim() || null,
        updated_at: new Date().toISOString()
      };

      if (editingTemplate) {
        const { error } = await supabase
          .from("transaction_templates")
          .update(payload)
          .eq("id", editingTemplate.id);

        if (error) throw error;
        showSuccessToast(`Template "${name}" berhasil diperbarui!`);
      } else {
        const { error } = await supabase
          .from("transaction_templates")
          .insert(payload);

        if (error) throw error;
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
      label: `${w.name} (${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(w.balance)})`,
      icon: <WalletIcon className="w-4 h-4 text-text-secondary" />
    })),
    ...(type === "expense" && paylaterPlatforms.filter((p) => !p.is_archived).length > 0
      ? [
          { value: "header-paylater", label: "Paylater (Kredit)", disabled: true },
          ...paylaterPlatforms.filter((p) => !p.is_archived).map((p) => ({
            value: `paylater:${p.id}`,
            label: `${p.name} (Outstanding: ${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(p.balance)})`,
            icon: <CreditCard className="w-4 h-4 text-text-secondary" />
          }))
        ]
      : [])
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingTemplate ? "Sunting Template Transaksi" : "Buat Template Transaksi Baru"}
      onSubmit={handleSubmit}
      footer={
        <>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            fullWidth
            onClick={onClose}
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={submitting}
            fullWidth
          >
            Simpan Template
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Template Name */}
        <FormField
          label="Nama Template"
          required
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Contoh: Kopi Harian, Bayar Kos, Uang Jajan"
        />

        {/* Transaction Type */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Jenis Transaksi</label>
          <div className="grid grid-cols-2 gap-2 bg-surface-hover/30 border border-border p-1 rounded-xl">
            <TabButton
              isActive={type === "expense"}
              onClick={() => {
                setType("expense");
                setCategoryId("");
              }}
              className={`py-2 text-xs rounded-lg ${type === "expense" ? "bg-expense/10 text-expense" : ""}`}
            >
              Pengeluaran
            </TabButton>
            <TabButton
              isActive={type === "income"}
              onClick={() => {
                setType("income");
                setCategoryId("");
              }}
              className={`py-2 text-xs rounded-lg ${type === "income" ? "bg-income/10 text-income" : ""}`}
            >
              Pemasukan
            </TabButton>
          </div>
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
            Jumlah Uang
            <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm font-bold text-text-secondary select-none">
              Rp.
            </span>
            <input
              type="text"
              value={amount ? parseInt(amount).toLocaleString("id-ID") : ""}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9]/g, "");
                setAmount(raw);
              }}
              placeholder="0"
              className="w-full pl-11 pr-4 py-2.5 bg-surface-input border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-text-primary text-sm font-bold font-mono outline-none transition-all focus-glow"
              required
            />
          </div>
          <p className="text-xs text-text-muted">
            Terformat: {getFormattedPreview()}
          </p>
        </div>

        {/* Source of Funds */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
            Sumber Dana
            <span className="text-danger">*</span>
          </label>
          <CustomSelect
            value={sourceId}
            onChange={setSourceId}
            options={sourceOptions}
            placeholder="Pilih Sumber Dana"
          />
        </div>

        {/* Category Grid */}
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
              placeholder="Contoh: Catatan tambahan untuk template ini..."
              rows={2}
              className="w-full pl-9 pr-4 py-2 bg-surface-input border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-text-primary text-xs outline-none transition-all resize-none focus-glow"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}

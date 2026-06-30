"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useApp, TransactionTemplateItem } from "@/app/providers/AppProvider";
import { useToast } from "@/components/ui/molecules/Toast";
import { FormField } from "@/components/ui/molecules/FormField";
import { Input } from "@/components/ui/atoms/Input";
import { Modal } from "@/components/ui/organisms/Modal";
import { ModalFooter } from "@/components/ui/molecules/ModalFooter";
import { getIconComponent } from "@/lib/utils/icons";
import { Sparkles, Calendar, CheckSquare, Square, Wallet as WalletIcon, CreditCard, FolderMinus, Loader2, Edit2 } from "lucide-react";
import { TemplateModal } from "@/app/(app)/settings/components/modals/TemplateModal";

interface RunTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function RunTemplatesModal({
  isOpen,
  onClose,
  onSuccess
}: RunTemplatesModalProps) {
  const supabase = createClient();
  const {
    user,
    templates,
    categories,
    wallets,
    paylaterPlatforms,
    refreshWallets,
    refreshPaylaterPlatforms,
    refreshTemplates
  } = useApp();
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [transactionDate, setTransactionDate] = useState<string>(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });
  const [running, setRunning] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TransactionTemplateItem | null>(null);

  // Pre-select all templates by default when modal opens
  useEffect(() => {
    if (isOpen && templates.length > 0) {
      setSelectedIds(templates.map((t) => t.id));
    } else {
      setSelectedIds([]);
    }
  }, [isOpen, templates]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === templates.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(templates.map((t) => t.id));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(amount);
  };

  async function handleRunTemplates(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    if (selectedIds.length === 0) {
      showErrorToast("Silakan pilih minimal satu template untuk dijalankan.");
      return;
    }

    setRunning(true);
    try {
      const selectedTemplates = templates.filter((t) => selectedIds.includes(t.id));
      
      const payload = selectedTemplates.map((template) => {
        // Construct description fallback if none is specified
        const finalDescription = template.description?.trim() || template.name;
        
        // Combine date input with current local time to make sure they get sorted nicely if entered at the same time
        const now = new Date();
        const baseDate = new Date(transactionDate);
        baseDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());

        return {
          user_id: user.id,
          wallet_id: template.wallet_id,
          paylater_id: template.paylater_id,
          category_id: template.category_id,
          amount: template.amount,
          type: template.type,
          description: finalDescription,
          transaction_date: baseDate.toISOString()
        };
      });

      const { error } = await supabase.from("transactions").insert(payload);
      if (error) throw error;

      showSuccessToast(`${selectedIds.length} transaksi berhasil dibuat secara massal.`);
      
      // Refresh wallet & paylater states in provider
      await Promise.all([refreshWallets(), refreshPaylaterPlatforms()]);
      
      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error("Error executing bulk templates:", err);
      const message = err instanceof Error ? err.message : String(err);
      showErrorToast("Gagal menjalankan template: " + message);
    } finally {
      setRunning(false);
    }
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Jalankan Template Transaksi"
        onSubmit={handleRunTemplates}
        className="sm:max-w-lg"
        footer={
          <ModalFooter
            onCancel={onClose}
            isSubmitting={running}
            disabled={selectedIds.length === 0}
            submitText={`Jalankan (${selectedIds.length})`}
          />
        }
      >
        <div className="space-y-4">
          {templates.length === 0 ? (
            <div className="py-8 text-center flex flex-col items-center justify-center gap-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-surface-hover text-text-secondary/40">
                <FolderMinus className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-text-primary">
                Belum ada template transaksi
              </h4>
              <p className="text-[10px] text-text-secondary max-w-xs mx-auto">
                Silakan buat template transaksi terlebih dahulu melalui menu Pengaturan &gt; Template.
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs text-text-secondary leading-relaxed">
                Pilih template transaksi di bawah ini untuk dibuat secara massal. Saldo dompet atau outstanding paylater akan disinkronisasikan otomatis.
              </p>

              {/* Date Picker for Bulk Transactions */}
              <div className="bg-surface-hover/30 border border-border rounded-xl p-3">
                <FormField
                  label="Tanggal Transaksi"
                  required
                  containerClassName="!mb-0"
                >
                  <Input
                    type="date"
                    value={transactionDate}
                    onChange={(e) => setTransactionDate(e.target.value)}
                  />
                </FormField>
              </div>

              {/* Select All Toggle */}
              <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-text-primary transition-colors outline-none"
                >
                  {selectedIds.length === templates.length ? (
                    <CheckSquare className="w-4 h-4 text-primary" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                  <span>Pilih Semua ({templates.length})</span>
                </button>
              </div>

              {/* Templates Checkbox List */}
              <div className="space-y-2">
                {templates.map((template) => {
                  const category = categories.find((c) => c.id === template.category_id);
                  const wallet = wallets.find((w) => w.id === template.wallet_id);
                  const paylater = paylaterPlatforms.find((p) => p.id === template.paylater_id);
                  const CategoryIconComponent = category ? getIconComponent(category.icon) : null;
                  const isSelected = selectedIds.includes(template.id);

                  return (
                    <div
                      key={template.id}
                      onClick={() => toggleSelect(template.id)}
                      className={`border rounded-xl p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none transition-all ${
                        isSelected
                          ? "bg-primary/5 border-primary/50"
                          : "bg-surface-card border-border hover:border-border-strong"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Checkbox Icon */}
                        <div className="shrink-0 text-text-secondary/70">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-primary" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </div>

                        {/* Category Icon */}
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
                          style={{ backgroundColor: category?.color || "#94a3b8" }}
                        >
                          {CategoryIconComponent ? (
                            <CategoryIconComponent className="w-4.5 h-4.5" />
                          ) : (
                            <Calendar className="w-4.5 h-4.5" />
                          )}
                        </div>

                        {/* Meta */}
                        <div className="min-w-0">
                          <h5 className="text-xs font-bold text-text-primary truncate">
                            {template.name}
                          </h5>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[9px] text-text-secondary font-semibold mt-0.5">
                            <span className={`px-1.5 py-0.5 rounded-md ${
                              template.type === "expense" ? "bg-expense/10 text-expense" : "bg-income/10 text-income"
                            }`}>
                              {template.type === "expense" ? "Keluar" : "Masuk"}
                            </span>
                            <span className="flex items-center gap-1">
                              {wallet ? (
                                <>
                                  <WalletIcon className="w-3 h-3 text-primary shrink-0" />
                                  <span className="truncate max-w-[80px]">{wallet.name}</span>
                                </>
                              ) : paylater ? (
                                <>
                                  <CreditCard className="w-3 h-3 text-danger shrink-0" />
                                  <span className="truncate max-w-[80px]">{paylater.name}</span>
                                </>
                              ) : (
                                "-"
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <span className={`text-xs font-bold font-mono block ${
                            template.type === "income" ? "text-income" : "text-expense"
                          }`}>
                            {template.type === "income" ? "+" : "-"} {formatCurrency(template.amount)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTemplate(template);
                            setIsEditModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-surface-hover/50 hover:bg-surface-hover border border-border/50 text-text-secondary hover:text-text-primary transition-colors outline-none"
                          title="Edit Template"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </Modal>

      <TemplateModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTemplate(null);
        }}
        editingTemplate={editingTemplate}
        onSaveSuccess={refreshTemplates}
      />
    </>
  );
}

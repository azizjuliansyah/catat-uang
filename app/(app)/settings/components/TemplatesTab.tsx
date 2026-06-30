"use client";

import { useState } from "react";
import { useApp } from "@/app/providers/AppProvider";
import { TabButton, TabButtonGroup } from "@/components/ui/molecules/TabButtonGroup";
import { Button } from "@/components/ui/atoms/Button";
import { ActionButton } from "@/components/ui/atoms/ActionButton";
import { getIconComponent } from "@/lib/utils/icons";
import { Plus, Edit2, Trash2, FolderMinus, Wallet as WalletIcon, CreditCard, AlignLeft, TrendingDown, TrendingUp } from "lucide-react";
import { TemplateModal } from "./modals/TemplateModal";
import { DeleteTemplateModal } from "./modals/DeleteTemplateModal";
import { TransactionTemplateItem } from "@/app/providers/AppProvider";
import { formatIDR } from "../utils";
import { CategoryItemSkeleton } from "@/components/ui/skeleton/composite/CategoryItemSkeleton";

export function TemplatesTab() {
  const {
    templates,
    loadingTemplates: templatesLoading,
    refreshTemplates,
    categories,
    wallets,
    paylaterPlatforms
  } = useApp();

  const [templateType, setTemplateType] = useState<"expense" | "income">("expense");

  // Modals state
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TransactionTemplateItem | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<TransactionTemplateItem | null>(null);

  const filteredTemplates = templates.filter((t) => t.type === templateType);

  return (
    <div className="space-y-6">
      {/* Subtabs Expense/Income Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-card border border-border rounded-2xl p-4">
        <TabButtonGroup variant="pill-colored" className="h-10 items-center gap-1 self-start">
          <TabButton
            isActive={templateType === "expense"}
            onClick={() => setTemplateType("expense")}
            variant="pill-colored"
            className={`px-2 py-0 text-xs transition-all ${
              templateType === "expense"
                ? "bg-expense/25 border-none text-expense"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5 mr-1.5 inline" />
            Pengeluaran
          </TabButton>
          <TabButton
            isActive={templateType === "income"}
            onClick={() => setTemplateType("income")}
            variant="pill-colored"
            className={`px-2 py-0 h-full text-xs transition-all ${
              templateType === "income"
                ? "bg-income/25 border-none text-income"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 mr-1.5 inline" />
            Pemasukan
          </TabButton>
        </TabButtonGroup>

        <div className="flex gap-2 self-stretch sm:self-auto">
          <Button
            onClick={() => {
              setEditingTemplate(null);
              setIsTemplateModalOpen(true);
            }}
            size="sm"
            className="flex-1 sm:flex-initial"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Template Baru
          </Button>
        </div>
      </div>

      {/* Templates Grid List */}
      {templatesLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CategoryItemSkeleton key={`tpl-${i}`} height="tall" showDescription typeLabel={templateType === "expense" ? "Pengeluaran" : "Pemasukan"} />
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="bg-surface-card border border-border border-dashed rounded-2xl p-10 text-center flex flex-col items-center justify-center gap-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-surface-hover text-text-secondary/40">
            <FolderMinus className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-text-primary">
            Belum ada template transaksi
          </h3>
          <p className="text-xs text-text-secondary max-w-xs mx-auto">
            Buat template transaksi untuk melakukan pencatatan cepat di kemudian hari.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => {
            const category = categories.find((c) => c.id === template.category_id);
            const wallet = wallets.find((w) => w.id === template.wallet_id);
            const paylater = paylaterPlatforms.find((p) => p.id === template.paylater_id);
            const CategoryIconComponent = category ? getIconComponent(category.icon) : null;

            return (
              <div
                key={template.id}
                className="bg-surface-card border border-border hover:border-border-strong rounded-2xl p-5 flex flex-col justify-between transition-all group relative overflow-hidden"
              >
                {/* Top portion */}
                <div className="flex items-start justify-between gap-3 relative z-10">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: category?.color || "#94a3b8" }}
                    >
                      {CategoryIconComponent ? (
                        <CategoryIconComponent className="w-5 h-5" />
                      ) : (
                        <AlignLeft className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-text-primary truncate max-w-[180px]">
                        {template.name}
                      </h4>
                      <p className="text-[10px] font-semibold text-text-secondary">
                        Kategori: {category?.name || "Tanpa Kategori"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <ActionButton
                      icon={Edit2}
                      size="sm"
                      title="Edit Template"
                      onClick={() => {
                        setEditingTemplate(template);
                        setIsTemplateModalOpen(true);
                      }}
                    />
                    <ActionButton
                      icon={Trash2}
                      size="sm"
                      title="Hapus Template"
                      variant="danger"
                      onClick={() => setTemplateToDelete(template)}
                    />
                  </div>
                </div>

                {/* Bottom portion / details */}
                <div className="mt-4 flex items-center justify-between gap-4 relative z-10">
                  <div>
                    <span className="text-[10px] text-text-muted uppercase tracking-wider block font-semibold">
                      Jumlah Uang
                    </span>
                    <span className="text-sm font-bold font-mono text-text-primary">
                      {formatIDR(template.amount)}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-text-muted uppercase tracking-wider block font-semibold">
                      Sumber Dana
                    </span>
                    <div className="inline-flex items-center gap-1.5 mt-0.5 text-xs font-bold text-text-primary">
                      {wallet ? (
                        <>
                          <WalletIcon className="w-3.5 h-3.5 text-primary" />
                          <span>{wallet.name}</span>
                        </>
                      ) : paylater ? (
                        <>
                          <CreditCard className="w-3.5 h-3.5 text-danger" />
                          <span>{paylater.name}</span>
                        </>
                      ) : (
                        <span className="text-text-muted">-</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description if present */}
                {template.description && (
                  <div className="mt-3 bg-surface-hover/20 rounded-xl p-2.5 border border-border/30 text-[10px] text-text-secondary relative z-10 flex items-start gap-1.5">
                    <AlignLeft className="w-3.5 h-3.5 text-text-secondary/60 shrink-0 mt-0.5" />
                    <p className="line-clamp-2 italic">{template.description}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Template Modal (Add / Edit) */}
      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => {
          setIsTemplateModalOpen(false);
          setEditingTemplate(null);
        }}
        editingTemplate={editingTemplate}
        onSaveSuccess={refreshTemplates}
      />

      {/* Template Delete Modal */}
      <DeleteTemplateModal
        isOpen={templateToDelete !== null}
        onClose={() => setTemplateToDelete(null)}
        templateToDelete={templateToDelete}
        onDeleteSuccess={refreshTemplates}
      />
    </div>
  );
}

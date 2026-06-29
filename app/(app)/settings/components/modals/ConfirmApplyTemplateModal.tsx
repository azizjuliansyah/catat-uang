"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/organisms/Modal";
import { ModalFooter } from "@/components/ui/molecules/ModalFooter";
import { Sparkles, CircleDot } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getIconComponent } from "@/lib/utils/icons";

interface CategoryTemplate {
  id: string;
  name: string;
  type: "income" | "expense";
  icon: string;
  color: string;
}

interface ConfirmApplyTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}

export function ConfirmApplyTemplateModal({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
}: ConfirmApplyTemplateModalProps) {
  const [templates, setTemplates] = useState<CategoryTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("category_templates")
        .select("*")
        .order("type", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;
      setTemplates(data || []);
    } catch (err) {
      console.error("Error fetching templates:", err);
    } finally {
      setLoading(false);
    }
  };

  const incomeTemplates = templates.filter((t) => t.type === "income");
  const expenseTemplates = templates.filter((t) => t.type === "expense");

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Terapkan Template Kategori?"
      onSubmit={(e) => {
        e.preventDefault();
        onConfirm();
      }}
      footer={
        <ModalFooter
          onCancel={onClose}
          onSubmit={onConfirm}
          isSubmitting={isSubmitting}
          cancelText="Batal"
          submitText="Terapkan"
          variant="primary"
        />
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div className="flex-1 text-body text-text-secondary leading-relaxed">
            Apakah Anda yakin ingin menerapkan template kategori bawaan?
            <br />
            <br />
            Tindakan ini akan menambahkan kategori-kategori standar yang belum ada di akun Anda. Kategori yang sudah ada tidak akan diubah atau dihapus.
          </div>
        </div>

        {/* Template Categories List */}
        {loading ? (
          <div className="text-center text-text-muted text-sm py-4">
            Memuat daftar kategori...
          </div>
        ) : (
          <div className="space-y-4">
            {incomeTemplates.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-income mb-2 flex items-center gap-1.5">
                  <CircleDot className="w-3.5 h-3.5" />
                  Pemasukan ({incomeTemplates.length})
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {incomeTemplates.map((template) => {
                    const IconComponent = getIconComponent(template.icon);
                    return (
                      <div
                        key={template.id}
                        className="flex items-center gap-2 p-2 rounded-lg bg-surface-input/50 border border-border/40"
                      >
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-sm"
                          style={{ backgroundColor: template.color }}
                        >
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <span className="text-xs text-text-primary truncate">
                          {template.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {expenseTemplates.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-expense mb-2 flex items-center gap-1.5">
                  <CircleDot className="w-3.5 h-3.5" />
                  Pengeluaran ({expenseTemplates.length})
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {expenseTemplates.map((template) => {
                    const IconComponent = getIconComponent(template.icon);
                    return (
                      <div
                        key={template.id}
                        className="flex items-center gap-2 p-2 rounded-lg bg-surface-input/50 border border-border/40"
                      >
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-sm"
                          style={{ backgroundColor: template.color }}
                        >
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <span className="text-xs text-text-primary truncate">
                          {template.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

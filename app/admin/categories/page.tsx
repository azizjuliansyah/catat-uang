"use client";

import { useState, useEffect } from "react";
import {
  getCategoryTemplates,
  createCategoryTemplate,
  updateCategoryTemplate,
  deleteCategoryTemplate,
} from "@/app/admin/actions";
import { useToast } from "@/components/ui/molecules/Toast";
import { TabButton } from "@/components/ui/molecules/TabButton";
import { Button } from "@/components/ui/atoms/Button";
import { ActionButton } from "@/components/ui/atoms/ActionButton";
import { FormField } from "@/components/ui/molecules/FormField";
import { Modal } from "@/components/ui/organisms/Modal";
import { getIconComponent } from "@/lib/utils/icons";
import { Plus, Edit2, Trash2, FolderMinus, Check, Search } from "lucide-react";

interface CategoryTemplate {
  id: string;
  name: string;
  type: "income" | "expense";
  icon: string;
  color: string;
  created_at: string;
}

const PRESET_COLORS = [
  { name: "Emerald", hex: "#10B981" },
  { name: "Blue", hex: "#3B82F6" },
  { name: "Indigo", hex: "#6366F1" },
  { name: "Purple", hex: "#8B5CF6" },
  { name: "Pink", hex: "#EC4899" },
  { name: "Red", hex: "#EF4444" },
  { name: "Orange", hex: "#F59E0B" },
  { name: "Gray", hex: "#6B7280" }
];

const PRESET_ICONS = [
  "Briefcase",
  "TrendingUp",
  "Utensils",
  "Car",
  "ShoppingBag",
  "FileText",
  "Film",
  "HelpCircle"
];

export default function AdminCategoriesPage() {
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  
  const [templates, setTemplates] = useState<CategoryTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryType, setCategoryType] = useState<"expense" | "income">("expense");
  const [searchTerm, setSearchTerm] = useState("");

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CategoryTemplate | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<CategoryTemplate | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<"expense" | "income">("expense");
  const [formIcon, setFormIcon] = useState("HelpCircle");
  const [formColor, setFormColor] = useState("#10B981");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  async function fetchTemplates() {
    try {
      setLoading(true);
      const data = await getCategoryTemplates();
      setTemplates((data as unknown as CategoryTemplate[]) || []);
    } catch (err: unknown) {
      console.error("Error fetching templates:", err);
      showErrorToast("Gagal memuat template kategori");
    } finally {
      setLoading(false);
    }
  }

  // Open modal for Create
  const handleCreateOpen = () => {
    setEditingTemplate(null);
    setFormName("");
    setFormType(categoryType);
    setFormIcon("HelpCircle");
    setFormColor(categoryType === "expense" ? "#EF4444" : "#10B981");
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleEditOpen = (template: CategoryTemplate) => {
    setEditingTemplate(template);
    setFormName(template.name);
    setFormType(template.type);
    setFormIcon(template.icon);
    setFormColor(template.color);
    setIsModalOpen(true);
  };

  // Handle submit (Create / Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showErrorToast("Nama template kategori wajib diisi");
      return;
    }

    setSubmitting(true);
    try {
      if (editingTemplate) {
        // Edit template
        await updateCategoryTemplate(
          editingTemplate.id,
          formName.trim(),
          formType,
          formIcon,
          formColor
        );
        showSuccessToast(`Template "${formName}" berhasil diperbarui!`);
      } else {
        // Create template
        await createCategoryTemplate(
          formName.trim(),
          formType,
          formIcon,
          formColor
        );
        showSuccessToast(`Template "${formName}" berhasil ditambahkan!`);
      }
      setIsModalOpen(false);
      await fetchTemplates();
    } catch (err: unknown) {
      console.error("Error saving template:", err);
      const msg = err instanceof Error ? err.message : String(err);
      showErrorToast("Gagal menyimpan template: " + msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!templateToDelete) return;
    setDeleting(true);
    try {
      await deleteCategoryTemplate(templateToDelete.id);
      showSuccessToast(`Template "${templateToDelete.name}" berhasil dihapus!`);
      setTemplateToDelete(null);
      await fetchTemplates();
    } catch (err: unknown) {
      console.error("Error deleting template:", err);
      const msg = err instanceof Error ? err.message : String(err);
      showErrorToast("Gagal menghapus template: " + msg);
    } finally {
      setDeleting(false);
    }
  };

  // Filtered Templates
  const filteredTemplates = templates.filter((t) => {
    const matchesType = t.type === categoryType;
    const matchesSearch =
      searchTerm.trim() === "" ||
      t.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight font-display">Template Kategori</h1>
          <p className="text-xs text-text-secondary mt-1">Kelola template kategori global yang dapat disinkronkan oleh pengguna.</p>
        </div>

        <Button
          onClick={handleCreateOpen}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-medium transition-colors hover:shadow-lg hover:shadow-primary/10 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Template Baru
        </Button>
      </div>

      {/* Subtabs and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-card border border-border rounded-2xl p-4 shadow-sm">
        <div className="bg-surface-hover/30 border border-border p-1 rounded-xl flex gap-1 self-start">
          <TabButton
            isActive={categoryType === "expense"}
            onClick={() => setCategoryType("expense")}
            className="px-4 py-2 text-xs"
          >
            Pengeluaran
          </TabButton>
          <TabButton
            isActive={categoryType === "income"}
            onClick={() => setCategoryType("income")}
            className="px-4 py-2 text-xs"
          >
            Pemasukan
          </TabButton>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Cari template..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface-input border border-border hover:border-border-strong focus:border-primary rounded-xl text-xs text-text-primary placeholder:text-text-muted outline-none transition-all"
          />
        </div>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-16 bg-surface-card rounded-2xl border border-border/50 animate-pulse" />
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="bg-surface-card border border-border border-dashed rounded-2xl p-10 text-center flex flex-col items-center justify-center gap-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-surface-hover text-text-secondary/40">
            <FolderMinus className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-text-primary">
            Belum ada template
          </h3>
          <p className="text-xs text-text-secondary max-w-xs mx-auto">
            Tambahkan template baru untuk mempermudah pengguna memisahkan transaksi mereka.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => {
            const IconComponent = getIconComponent(template.icon);
            return (
              <div
                key={template.id}
                className="bg-surface-card border border-border hover:border-border-strong rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow transition-all group relative overflow-hidden"
              >
                {/* Hover bg color highlight */}
                <div 
                  className="absolute inset-0 pointer-events-none opacity-[0.01] group-hover:opacity-[0.03] transition-opacity" 
                  style={{ backgroundColor: template.color }} 
                />

                <div className="flex items-center gap-3 relative z-10">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                    style={{ backgroundColor: template.color }}
                  >
                    <IconComponent className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-text-primary truncate max-w-[130px]">
                      {template.name}
                    </p>
                    <p className="text-[9px] font-semibold text-text-secondary uppercase tracking-wider">
                      {template.type === "expense" ? "Pengeluaran" : "Pemasukan"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-0.5 relative z-10 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <ActionButton
                    icon={Edit2}
                    title="Edit Template"
                    onClick={() => handleEditOpen(template)}
                  />
                  <ActionButton
                    icon={Trash2}
                    title="Hapus Template"
                    variant="danger"
                    onClick={() => setTemplateToDelete(template)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTemplate ? "Sunting Template Kategori" : "Buat Template Kategori Baru"}
        onSubmit={handleSubmit}
        footer={
          <>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              fullWidth
              onClick={() => setIsModalOpen(false)}
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
              Simpan
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <FormField
            label="Nama Template"
            required
            type="text"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="Contoh: Belanja Bulanan, Gaji, Makan Luar"
          />

          {/* Type Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
              Jenis Kategori
              <span className="text-danger">*</span>
            </label>
            <div className="flex gap-2 bg-surface-input/30 border border-border p-1.5 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setFormType("expense");
                  if (formColor === "#10B981") setFormColor("#EF4444");
                }}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  formType === "expense"
                    ? "bg-danger text-white"
                    : "text-text-secondary hover:bg-surface-hover"
                }`}
              >
                Pengeluaran
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormType("income");
                  if (formColor === "#EF4444") setFormColor("#10B981");
                }}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  formType === "income"
                    ? "bg-success text-white"
                    : "text-text-secondary hover:bg-surface-hover"
                }`}
              >
                Pemasukan
              </button>
            </div>
          </div>

          {/* Icon Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
              Pilih Ikon
              <span className="text-danger">*</span>
            </label>
            <div className="grid grid-cols-4 gap-2 bg-surface-input/30 border border-border p-3 rounded-xl max-h-40 overflow-y-auto">
              {PRESET_ICONS.map((iconName) => {
                const IconComp = getIconComponent(iconName);
                return (
                  <ActionButton
                    key={iconName}
                    icon={IconComp}
                    title={iconName}
                    variant="ghost"
                    size="sm"
                    isSelected={formIcon === iconName}
                    selectedColor="var(--color-primary)"
                    onClick={() => setFormIcon(iconName)}
                  />
                );
              })}
            </div>
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
              Pilih Warna
              <span className="text-danger">*</span>
            </label>
            <div className="flex flex-wrap gap-2 bg-surface-input/30 border border-border p-3 rounded-xl">
              {PRESET_COLORS.map((col) => {
                const isSelected = formColor.toLowerCase() === col.hex.toLowerCase();
                return (
                  <Button
                    key={col.hex}
                    type="button"
                    variant="ghost"
                    onClick={() => setFormColor(col.hex)}
                    className={`w-7 h-7 p-0 min-h-0 rounded-full transition-all cursor-pointer flex items-center justify-center border-2 border-transparent ${
                      isSelected
                        ? "border-text-primary scale-110 shadow-sm"
                        : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: col.hex }}
                    title={col.name}
                  >
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />
                    )}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={templateToDelete !== null}
        onClose={() => setTemplateToDelete(null)}
        title="Hapus Template Kategori"
        isDestructive
        footer={
          <>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              fullWidth
              onClick={() => setTemplateToDelete(null)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              isLoading={deleting}
              fullWidth
              onClick={handleDeleteConfirm}
            >
              Hapus
            </Button>
          </>
        }
      >
        <p className="text-xs text-text-secondary">
          Apakah Anda yakin ingin menghapus template kategori{" "}
          <span className="font-bold text-text-primary">
            "{templateToDelete?.name}"
          </span>
          ? Aksi ini tidak dapat dibatalkan.
        </p>
      </Modal>
    </div>
  );
}

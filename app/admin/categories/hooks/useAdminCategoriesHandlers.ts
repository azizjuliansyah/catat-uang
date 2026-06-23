import { useEffect } from "react";
import {
  getCategoryTemplates,
  createCategoryTemplate,
  updateCategoryTemplate,
  deleteCategoryTemplate,
} from "../actions";
import { CategoryTemplate } from "../types";
import { AdminCategoriesState } from "./useAdminCategoriesState";

interface Toast {
  success: (msg: string) => void;
  error: (msg: string) => void;
}

export function useAdminCategoriesHandlers(
  state: AdminCategoriesState,
  toast: Toast
) {
  const { success: showSuccessToast, error: showErrorToast } = toast;

  const {
    setTemplates,
    setLoading,
    categoryType,
    setIsModalOpen,
    setEditingTemplate,
    editingTemplate,
    templateToDelete,
    setTemplateToDelete,
    formName,
    setFormName,
    formType,
    setFormType,
    formIcon,
    setFormIcon,
    formColor,
    setFormColor,
    setSubmitting,
    setDeleting
  } = state;

  const fetchTemplates = async () => {
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
  };

  useEffect(() => {
    fetchTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateOpen = () => {
    setEditingTemplate(null);
    setFormName("");
    setFormType(categoryType);
    setFormIcon("HelpCircle");
    setFormColor(categoryType === "expense" ? "#EF4444" : "#10B981");
    setIsModalOpen(true);
  };

  const handleEditOpen = (template: CategoryTemplate) => {
    setEditingTemplate(template);
    setFormName(template.name);
    setFormType(template.type);
    setFormIcon(template.icon);
    setFormColor(template.color);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showErrorToast("Nama template kategori wajib diisi");
      return;
    }

    setSubmitting(true);
    try {
      if (editingTemplate) {
        await updateCategoryTemplate(
          editingTemplate.id,
          formName.trim(),
          formType,
          formIcon,
          formColor
        );
        showSuccessToast(`Template "${formName}" berhasil diperbarui!`);
      } else {
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

  return {
    fetchTemplates,
    handleCreateOpen,
    handleEditOpen,
    handleSubmit,
    handleDeleteConfirm
  };
}

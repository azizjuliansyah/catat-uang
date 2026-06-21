import { useState } from "react";
import { CategoryTemplate } from "../types";

export function useAdminCategoriesState() {
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

  return {
    templates,
    setTemplates,
    loading,
    setLoading,
    categoryType,
    setCategoryType,
    searchTerm,
    setSearchTerm,
    isModalOpen,
    setIsModalOpen,
    editingTemplate,
    setEditingTemplate,
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
    submitting,
    setSubmitting,
    deleting,
    setDeleting
  };
}

export type AdminCategoriesState = ReturnType<typeof useAdminCategoriesState>;

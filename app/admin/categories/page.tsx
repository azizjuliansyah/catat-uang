"use client";

import { useToast } from "@/components/ui/molecules/Toast";
import { Button } from "@/components/ui/atoms/Button";
import { PageHeader } from "@/components/ui/molecules/PageHeader";
import { Layers, Plus, FolderMinus } from "lucide-react";
import { useAdminCategoriesState, useAdminCategoriesHandlers } from "./hooks";
import { CategoryFilterBar, CategoriesGrid, CategoryTemplateModals } from "./components";
import { EmptyState } from "@/components/ui/organisms/EmptyState";
import { AdminCategoriesPageSkeleton } from "./page.skeleton";

export default function AdminCategoriesPage() {
  const toast = useToast();
  const state = useAdminCategoriesState();
  const handlers = useAdminCategoriesHandlers(state, toast);

  const {
    templates,
    loading,
    categoryType,
    setCategoryType,
    searchTerm,
    setSearchTerm,
    setTemplateToDelete
  } = state;

  const {
    handleCreateOpen,
    handleEditOpen,
    handleSubmit,
    handleDeleteConfirm
  } = handlers;

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
      <PageHeader
        icon={Layers}
        iconClassName="w-6 h-6 text-warning"
        title="Template Kategori"
        description="Kelola template kategori global yang dapat disinkronkan oleh pengguna."
        actions={
          <Button
            onClick={handleCreateOpen}
            variant="primary"
            size="sm"
          >
            <Plus className="w-4 h-4" />
            Template Baru
          </Button>
        }
      />

      {/* Filter Bar */}
      <CategoryFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        categoryType={categoryType}
        onTypeChange={setCategoryType}
      />

      {/* Grid List */}
      {loading ? (
        <AdminCategoriesPageSkeleton />
      ) : filteredTemplates.length === 0 ? (
        <EmptyState
          icon={FolderMinus}
          title="Belum ada template"
          description="Tambahkan template baru untuk mempermudah pengguna memisahkan transaksi mereka."
        />
      ) : (
        <CategoriesGrid
          templates={filteredTemplates}
          onEdit={handleEditOpen}
          onDelete={setTemplateToDelete}
        />
      )}

      {/* Modals component */}
      <CategoryTemplateModals
        state={state}
        handleSubmit={handleSubmit}
        handleDeleteConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

"use client";

import { useToast } from "@/components/ui/molecules/Toast";
import { Button } from "@/components/ui/atoms/Button";

import { useAdminCategoriesState } from "./hooks/useAdminCategoriesState";
import { useAdminCategoriesHandlers } from "./hooks/useAdminCategoriesHandlers";
import { CategoryTemplateModals } from "./components/CategoryTemplateModals";
import { CategoriesHeader } from "./components/CategoriesHeader";
import { CategoriesFilterBar } from "./components/CategoriesFilterBar";
import { CategoriesEmptyState } from "./components/CategoriesEmptyState";
import { CategoriesGrid } from "./components/CategoriesGrid";

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
      <CategoriesHeader onCreateClick={handleCreateOpen} />

      {/* Filter Bar */}
      <CategoriesFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        categoryType={categoryType}
        onTypeChange={setCategoryType}
      />

      {/* Grid List */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-16 bg-surface-card rounded-2xl border border-border/50 animate-pulse" />
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <CategoriesEmptyState />
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

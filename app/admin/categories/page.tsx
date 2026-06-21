"use client";

import { useToast } from "@/components/ui/molecules/Toast";
import { TabButton } from "@/components/ui/molecules/TabButton";
import { Button } from "@/components/ui/atoms/Button";
import { ActionButton } from "@/components/ui/atoms/ActionButton";
import { Modal } from "@/components/ui/organisms/Modal";
import { getIconComponent } from "@/lib/utils/icons";
import { Plus, Edit2, Trash2, FolderMinus, Search } from "lucide-react";

import { useAdminCategoriesState } from "./hooks/useAdminCategoriesState";
import { useAdminCategoriesHandlers } from "./hooks/useAdminCategoriesHandlers";
import { CategoryTemplateModals } from "./components/CategoryTemplateModals";

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

      {/* Modals component */}
      <CategoryTemplateModals
        state={state}
        handleSubmit={handleSubmit}
        handleDeleteConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

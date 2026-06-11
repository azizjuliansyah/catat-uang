"use client";

import { useState } from "react";
import { useApp } from "@/app/providers/AppProvider";
import { TabButton } from "@/components/ui/molecules/TabButton";
import { Button } from "@/components/ui/atoms/Button";
import { ActionButton } from "@/components/ui/atoms/ActionButton";
import { getIconComponent } from "@/lib/utils/icons";
import { Plus, Edit2, Trash2, FolderMinus } from "lucide-react";
import { CategoryModal } from "./modals/CategoryModal";
import { DeleteCategoryModal } from "./modals/DeleteCategoryModal";

interface Category {
  id: string;
  user_id: string;
  name: string;
  type: "income" | "expense";
  icon: string;
  color: string;
  created_at: string;
}

export function CategoriesTab() {
  const { categories, loadingCategories: categoriesLoading, refreshCategories } = useApp();
  const [categoryType, setCategoryType] = useState<"expense" | "income">("expense");

  // Modals state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const filteredCategories = categories.filter((c) => c.type === categoryType);

  return (
    <div className="space-y-6">
      {/* Subtabs Expense/Income Selector */}
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

        <Button
          onClick={() => {
            setEditingCategory(null);
            setIsCategoryModalOpen(true);
          }}
          size="sm"
          className="self-stretch sm:self-auto"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Kategori Baru
        </Button>
      </div>

      {/* Categories Grid List */}
      {categoriesLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-16 bg-surface-card rounded-2xl border border-border/50 animate-pulse" />
          ))}
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="bg-surface-card border border-border border-dashed rounded-2xl p-10 text-center flex flex-col items-center justify-center gap-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-surface-hover text-text-secondary/40">
            <FolderMinus className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-text-primary">
            Belum ada kategori
          </h3>
          <p className="text-xs text-text-secondary max-w-xs mx-auto">
            Tambahkan kategori baru untuk memisahkan pengeluaran atau pemasukan Anda secara detail.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredCategories.map((cat) => {
            const IconComponent = getIconComponent(cat.icon);
            return (
              <div
                key={cat.id}
                className="bg-surface-card border border-border hover:border-border-strong rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow transition-all group relative overflow-hidden"
              >
                {/* Hover bg color highlight */}
                <div 
                  className="absolute inset-0 pointer-events-none opacity-[0.01] group-hover:opacity-[0.03] transition-opacity" 
                  style={{ backgroundColor: cat.color }} 
                />

                <div className="flex items-center gap-3 relative z-10">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                    style={{ backgroundColor: cat.color }}
                  >
                    <IconComponent className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-text-primary truncate max-w-[130px]">
                      {cat.name}
                    </p>
                    <p className="text-[9px] font-semibold text-text-secondary uppercase tracking-wider">
                      {cat.type === "expense" ? "Pengeluaran" : "Pemasukan"}
                    </p>
                  </div>
                </div>

                  <div className="flex items-center gap-0.5 relative z-10 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <ActionButton
                      icon={Edit2}
                      title="Edit Kategori"
                      onClick={() => {
                        setEditingCategory(cat);
                        setIsCategoryModalOpen(true);
                      }}
                    />
                    <ActionButton
                      icon={Trash2}
                      title="Hapus Kategori"
                      variant="danger"
                      onClick={() => setCategoryToDelete(cat)}
                    />
                  </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Category Modal (Add / Edit) */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setEditingCategory(null);
        }}
        editingCategory={editingCategory}
        categoryType={categoryType}
        onSaveSuccess={refreshCategories}
      />

      {/* Category Delete Modal */}
      <DeleteCategoryModal
        isOpen={categoryToDelete !== null}
        onClose={() => setCategoryToDelete(null)}
        categoryToDelete={categoryToDelete}
        onDeleteSuccess={refreshCategories}
      />
    </div>
  );
}

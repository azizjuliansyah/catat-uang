"use client";

import { ItemGridSelector, type GridItem } from "@/components/ui/molecules/ItemGridSelector";

interface Category {
  id: string;
  user_id: string;
  name: string;
  type: "income" | "expense";
  icon: string;
  color: string;
  created_at: string;
}

interface CategoryGridSelectorProps {
  categories: Category[];
  categoryId: string;
  setCategoryId: (id: string) => void;
  type: "expense" | "income";
}

export function CategoryGridSelector({
  categories,
  categoryId,
  setCategoryId,
  type
}: CategoryGridSelectorProps) {
  const filteredCategories = categories.filter((c) => c.type === type);

  return (
    <ItemGridSelector
      items={filteredCategories as GridItem[]}
      selected={categoryId}
      onSelect={setCategoryId}
      label="Pilih Kategori"
      required
      emptyMessage="Belum ada kategori untuk jenis transaksi ini. Buat kategori baru di Pengaturan."
    />
  );
}

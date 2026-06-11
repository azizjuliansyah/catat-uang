"use client";

import { getIconComponent } from "@/lib/utils/icons";
import { Button } from "@/components/ui/atoms/Button";

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
    <div className="space-y-2">
      <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
        Pilih Kategori
        <span className="text-danger">*</span>
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-surface-input border border-border p-3 rounded-xl max-h-48 overflow-y-auto">
        {filteredCategories.map((cat) => {
          const IconComponent = getIconComponent(cat.icon);
          return (
            <Button
              key={cat.id}
              type="button"
              variant="ghost"
              onClick={() => setCategoryId(cat.id)}
              className={`p-3 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all border text-center cursor-pointer min-h-0 h-auto font-normal ${
                categoryId === cat.id
                  ? "border-primary bg-primary/10 text-primary font-semibold hover:bg-primary/15 hover:text-primary"
                  : "border-transparent text-text-secondary hover:bg-surface-hover hover:text-text-primary"
              }`}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm"
                style={{ backgroundColor: cat.color }}
              >
                <IconComponent className="w-4 h-4" />
              </div>
              <span className="text-[10px] truncate w-full">{cat.name}</span>
            </Button>
          );
        })}

        {filteredCategories.length === 0 && (
          <div className="col-span-full py-4 text-center text-xs text-text-secondary">
            Belum ada kategori untuk jenis transaksi ini. Buat kategori baru di Pengaturan.
          </div>
        )}
      </div>
    </div>
  );
}

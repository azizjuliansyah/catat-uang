"use client";

import { ActionButton } from "@/components/ui/atoms/ActionButton";
import { getIconComponent } from "@/lib/utils/icons";
import { Edit2, Trash2 } from "lucide-react";
import { CategoryTemplate } from "../types";

interface CategoriesGridProps {
  templates: CategoryTemplate[];
  onEdit: (template: CategoryTemplate) => void;
  onDelete: (template: CategoryTemplate) => void;
}

export function CategoriesGrid({
  templates,
  onEdit,
  onDelete,
}: CategoriesGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {templates.map((template) => {
        const IconComponent = getIconComponent(template.icon);
        return (
          <div
            key={template.id}
            className="bg-surface-card border border-border hover:border-border-strong rounded-2xl p-5 transition-all group relative overflow-hidden"
          >
            <div className="flex items-start justify-between gap-3 relative z-10">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: template.color }}
                >
                  <IconComponent className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-text-primary">
                    {template.name}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-text-secondary mt-0.5">
                    <span
                      className={`px-1.5 py-0.5 rounded-md font-semibold ${
                        template.type === "income"
                          ? "bg-income/10 text-income"
                          : "bg-expense/10 text-expense"
                      }`}
                    >
                      {template.type === "income" ? "Pemasukan" : "Pengeluaran"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-0.5 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <ActionButton
                  icon={Edit2}
                  size="sm"
                  title="Edit Template"
                  onClick={() => onEdit(template)}
                />
                <ActionButton
                  icon={Trash2}
                  size="sm"
                  title="Hapus Template"
                  variant="danger"
                  onClick={() => onDelete(template)}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

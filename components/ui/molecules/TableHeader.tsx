import React, { ReactNode } from "react";

export interface TableColumn {
  id: string;
  label: string;
  align?: "left" | "center" | "right";
  className?: string;
  width?: string; // e.g., "200px", "20%", "minmax(200px, 1fr)"
}

interface TableHeaderProps {
  columns: TableColumn[];
  className?: string;
}

export function TableHeader({ columns, className = "" }: TableHeaderProps) {
  return (
    <thead className={`bg-surface-input text-text-secondary uppercase text-xs font-bold ${className}`}>
      <tr>
        {columns.map((column) => (
          <th
            key={column.id}
            style={{ width: column.width }}
            className={`px-4 py-3 ${column.align === "center" ? "text-center" : column.align === "right" ? "text-right" : ""} ${column.className || ""}`}
          >
            {column.label}
          </th>
        ))}
      </tr>
    </thead>
  );
}

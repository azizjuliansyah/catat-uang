import React, { ReactNode } from "react";
import type { TableColumn } from "./TableHeader";

interface TableBodyProps {
  children: ReactNode;
  className?: string;
}

export function TableBody({ children, className = "" }: TableBodyProps) {
  return (
    <tbody className={`divide-y divide-border text-text-primary ${className}`}>
      {children}
    </tbody>
  );
}

interface TableBodySkeletonProps {
  rowCount?: number;
  columns: TableColumn[];
}

export function TableBodySkeleton({ rowCount = 5, columns }: TableBodySkeletonProps) {
  return (
    <tbody className="divide-y divide-border">
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <tr key={rowIndex} className="animate-pulse">
          {columns.map((column) => (
            <td
              key={column.id}
              style={{ width: column.width }}
              className="px-4 py-3"
            >
              <div className="h-4 bg-surface-hover rounded w-full max-w-[200px]" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

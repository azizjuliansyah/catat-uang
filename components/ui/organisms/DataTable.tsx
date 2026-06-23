import React from "react";
import { EmptyState } from "./EmptyState";
import { Package } from "lucide-react";

export interface ColumnDef<T = any> {
  id: string;
  header: string | React.ReactNode;
  accessor?: keyof T | ((row: T) => any);
  cell?: (props: { row: T; value: any; rowIndex: number }) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T = any> {
  columns: ColumnDef<T>[];
  data: T[];
  sortable?: boolean;
  onSort?: (columnId: string, direction: "asc" | "desc") => void;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  pagination?: boolean;
  pageSize?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  loading?: boolean;
  emptyState?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
  rowClassName?: string | ((row: T, rowIndex: number) => string);
  onRowClick?: (row: T, rowIndex: number) => void;
}

export function DataTable<T = any>({
  columns,
  data = [],
  sortable = false,
  onSort,
  sortColumn,
  sortDirection = "asc",
  pagination = false,
  pageSize = 10,
  currentPage = 1,
  onPageChange,
  loading = false,
  emptyState,
  emptyTitle = "Tidak ada data",
  emptyDescription = "Belum ada data yang tersedia",
  className = "",
  rowClassName,
  onRowClick,
}: DataTableProps<T>) {
  const [internalSort, setInternalSort] = React.useState<{
    column: string;
    direction: "asc" | "desc";
  }>({ column: "", direction: "asc" });

  const handleSort = (columnId: string) => {
    if (!sortable) return;

    const newDirection =
      internalSort.column === columnId && internalSort.direction === "asc"
        ? "desc"
        : "asc";

    setInternalSort({ column: columnId, direction: newDirection });
    onSort?.(columnId, newDirection);
  };

  const getCellValue = (row: T, column: ColumnDef<T>) => {
    if (column.cell) {
      return column.cell({
        row,
        value:
          typeof column.accessor === "function"
            ? column.accessor(row)
            : column.accessor
            ? row[column.accessor as keyof T]
            : undefined,
        rowIndex: data.indexOf(row),
      });
    }
    if (typeof column.accessor === "function") {
      return column.accessor(row);
    }
    if (column.accessor) {
      return row[column.accessor as keyof T] as React.ReactNode;
    }
    return null;
  };

  const getRowClassName = (row: T, rowIndex: number): string => {
    if (typeof rowClassName === "function") {
      return rowClassName(row, rowIndex);
    }
    return rowClassName || "";
  };

  // Pagination
  const startIndex = pagination ? (currentPage - 1) * pageSize : 0;
  const endIndex = pagination ? startIndex + pageSize : data.length;
  const paginatedData = pagination
    ? data.slice(startIndex, endIndex)
    : data;
  const totalPages = pagination ? Math.ceil(data.length / pageSize) : 1;

  if (loading) {
    return (
      <div className="overflow-x-auto font-sans">
        <div className="animate-pulse">
          <div className="h-10 bg-surface-hover rounded-t-lg" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-16 bg-surface-input border-b border-border/40"
            />
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={className}>
        {emptyState || (
          <EmptyState
            icon={Package}
            title={emptyTitle}
            description={emptyDescription}
          />
        )}
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto font-sans ${className}`}>
      <table className="w-full text-sm text-left">
        <thead className="bg-surface-input text-text-secondary uppercase text-xs">
          <tr>
            {columns.map((column) => {
              const isSorted =
                (sortColumn || internalSort.column) === column.id;
              const sortDir = sortDirection || internalSort.direction;

              return (
                <th
                  key={column.id}
                  className={`px-4 py-3 font-medium ${
                    column.sortable && sortable
                      ? "cursor-pointer hover:bg-surface-hover transition-colors"
                      : ""
                  } ${column.className || ""}`}
                  onClick={() => column.sortable && handleSort(column.id)}
                >
                  <div className="flex items-center gap-1">
                    {column.header}
                    {column.sortable && sortable && (
                      <span className="text-text-muted">
                        {isSorted && sortDir === "asc" ? "▲" : isSorted && sortDir === "desc" ? "▼" : "▼"}
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40 text-text-primary">
          {paginatedData.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={`hover:bg-surface-hover transition-colors ${
                onRowClick ? "cursor-pointer" : ""
              } ${getRowClassName(row, rowIndex)}`}
              onClick={() => onRowClick?.(row, rowIndex)}
            >
              {columns.map((column) => (
                <td
                  key={column.id}
                  className={`px-4 py-3 ${column.className || ""}`}
                >
                  {getCellValue(row, column)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <div className="text-sm text-text-secondary">
            Menampilkan {startIndex + 1} - {Math.min(endIndex, data.length)} dari{" "}
            {data.length} data
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-border rounded-lg hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sebelumnya
            </button>
            <span className="text-sm text-text-secondary">
              Halaman {currentPage} dari {totalPages}
            </span>
            <button
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-border rounded-lg hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Berikutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

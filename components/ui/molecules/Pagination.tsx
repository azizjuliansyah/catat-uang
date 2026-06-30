import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Select } from "../atoms/Select";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
}

export function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Safeguard currentPage if totalItems changes
  React.useEffect(() => {
    if (currentPage > totalPages) {
      onPageChange(totalPages);
    }
  }, [totalItems, pageSize, currentPage, totalPages, onPageChange]);

  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/50 text-xs text-text-secondary select-none">
      {/* Left side: Rows per page selection */}
      <div className="flex items-center gap-2">
        <span>Baris per halaman:</span>
        <Select
          size="sm"
          value={pageSize}
          onChange={(e) => {
            onPageSizeChange(Number(e.target.value));
            onPageChange(1); // Reset to page 1 on page size change
          }}
          className="w-16 h-8 text-[11px] px-2 py-0.5 rounded-lg border-border"
        >
          {pageSizeOptions.map((opt) => (
            <option key={opt} value={opt} className="bg-surface-card">
              {opt}
            </option>
          ))}
        </Select>
        <span className="ml-2 font-medium">
          {startIndex} - {endIndex} dari {totalItems} data
        </span>
      </div>

      {/* Right side: Navigation buttons */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="p-1 rounded-lg border border-border hover:bg-surface-hover transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          aria-label="Halaman Sebelumnya"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="font-medium">
          Halaman {currentPage} dari {totalPages}
        </span>
        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="p-1 rounded-lg border border-border hover:bg-surface-hover transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          aria-label="Halaman Berikutnya"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

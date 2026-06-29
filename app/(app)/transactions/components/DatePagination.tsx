"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/atoms/Button";

interface DatePaginationProps {
  date: string;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  itemsPerPageOptions?: number[];
}

const DEFAULT_ITEMS_PER_PAGE_OPTIONS = [5, 10, 20, 50];

export function DatePagination({
  date,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  itemsPerPageOptions = DEFAULT_ITEMS_PER_PAGE_OPTIONS,
}: DatePaginationProps) {
  // Always show pagination controls
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-between gap-3 pl-1 text-xs text-text-muted">
      <span>
        {totalItems === 0 ? "0 data" : `${startItem} - ${endItem} dari ${totalItems} transaksi`}
      </span>

      {/* Always show pagination controls */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="rounded-lg h-7 px-2"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </Button>

        <div className="flex items-center gap-0.5">
          {getPageNumbers().map((page, idx) =>
            typeof page === "number" ? (
              <Button
                key={idx}
                variant={page === currentPage ? "primary" : "ghost"}
                size="sm"
                onClick={() => onPageChange(page)}
                className="rounded-lg h-7 w-7 p-0 text-xs"
              >
                {page}
              </Button>
            ) : (
              <span key={idx} className="text-text-muted px-1">
                {page}
              </span>
            )
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="rounded-lg h-7 px-2"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

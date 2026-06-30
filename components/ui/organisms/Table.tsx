import React, { ReactNode } from "react";
import type { TableColumn } from "@/components/ui/molecules/TableHeader";
import { TableHeader } from "@/components/ui/molecules/TableHeader";
import { TableBody, TableBodySkeleton } from "@/components/ui/molecules/TableBody";

interface TableProps {
  columns: TableColumn[];
  children: ReactNode;
  loading?: boolean;
  skeletonRowCount?: number;
  className?: string;
  wrapperClassName?: string;
}

export function Table({
  columns,
  children,
  loading = false,
  skeletonRowCount = 5,
  className = "",
  wrapperClassName = "",
}: TableProps) {
  return (
    <div className={`overflow-x-auto font-sans ${wrapperClassName}`}>
      <table className={`w-full text-sm text-left ${className}`}>
        <TableHeader columns={columns} />
        {loading ? (
          <TableBodySkeleton rowCount={skeletonRowCount} columns={columns} />
        ) : (
          <TableBody>{children}</TableBody>
        )}
      </table>
    </div>
  );
}

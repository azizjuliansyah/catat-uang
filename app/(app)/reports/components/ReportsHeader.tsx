"use client";

import { Button } from "@/components/ui/atoms/Button";
import { Table, FileText } from "lucide-react";

interface ReportsHeaderProps {
  exportingExcel: boolean;
  exportingPDF: boolean;
  onExportExcel: () => void;
  onExportPDF: () => void;
}

export function ReportsHeader({
  exportingExcel,
  exportingPDF,
  onExportExcel,
  onExportPDF
}: ReportsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight font-display">Laporan Keuangan</h1>
        <p className="text-xs text-text-secondary mt-1">Analisis arus kas (cashflow), breakdown pengeluaran, dan ekspor data.</p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={onExportExcel}
          disabled={exportingExcel}
          className="shrink-0"
        >
          <Table className="w-4 h-4 mr-1.5" />
          {exportingExcel ? "Menulis..." : "Excel"}
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={onExportPDF}
          disabled={exportingPDF}
          className="shrink-0"
        >
          <FileText className="w-4 h-4 mr-1.5" />
          {exportingPDF ? "Menulis..." : "PDF"}
        </Button>
      </div>
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/atoms/Button";
import { PageHeader } from "@/components/ui/molecules/PageHeader";
import { Table, FileText, BarChart3 } from "lucide-react";

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
    <PageHeader
      icon={BarChart3}
      title="Laporan Keuangan"
      description="Analisis arus kas (cashflow), breakdown pengeluaran, dan ekspor data."
      actions={
        <>
          <Button
            variant="success"
            size="sm"
            onClick={onExportExcel}
            disabled={exportingExcel}
          >
            <Table className="w-4 h-4 mr-1.5" />
            {exportingExcel ? "Menulis..." : "Excel"}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onExportPDF}
            disabled={exportingPDF}
          >
            <FileText className="w-4 h-4 mr-1.5" />
            {exportingPDF ? "Menulis..." : "PDF"}
          </Button>
        </>
      }
    />
  );
}

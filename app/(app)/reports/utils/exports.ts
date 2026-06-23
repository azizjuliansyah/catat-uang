import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { formatIDR } from "@/lib/utils/format";

interface Transaction {
  id: string;
  amount: number;
  type: "income" | "expense";
  transaction_date: string;
  description: string | null;
  categories: {
    name: string;
    icon: string;
    color: string;
  } | null;
  wallets: {
    name: string;
  } | null;
}

interface CategoryBreakdown {
  name: string;
  amount: number;
  color: string;
  percentage: number;
}

interface ExportPDFProps {
  startDate: Date;
  endDate: Date;
  totalIncome: number;
  totalExpense: number;
  netCashflow: number;
  currentWalletsTotal: number;
  currentDebtsOwe: number;
  categoryBreakdown: CategoryBreakdown[];
  filteredTransactions: Transaction[];
  formatPercentage: (val: number) => string;
  showSuccessToast: (msg: string) => void;
  showErrorToast: (msg: string) => void;
  setExportingPDF: (val: boolean) => void;
}

export async function exportToPDF({
  startDate,
  endDate,
  totalIncome,
  totalExpense,
  netCashflow,
  currentWalletsTotal,
  currentDebtsOwe,
  categoryBreakdown,
  filteredTransactions,
  formatPercentage,
  showSuccessToast,
  showErrorToast,
  setExportingPDF
}: ExportPDFProps) {
  try {
    setExportingPDF(true);
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(16);
    doc.setTextColor(12, 92, 171); // Primary color
    doc.text("Laporan Keuangan CatatUang", pageWidth / 2, 20, { align: "center" });

    doc.setFontSize(9);
    doc.setTextColor(120);
    const periodText = `Periode Laporan: ${startDate.toLocaleDateString("id-ID")} s/d ${endDate.toLocaleDateString("id-ID")}`;
    doc.text(periodText, pageWidth / 2, 27, { align: "center" });

    let yPos = 40;
    doc.setFontSize(11);
    doc.setTextColor(50);
    doc.text("Ringkasan Neraca Saldo", 14, yPos);

    yPos += 7;
    doc.setFontSize(9);
    doc.text(`Total Pemasukan: ${formatIDR(totalIncome)}`, 14, yPos);
    yPos += 5;
    doc.text(`Total Pengeluaran: ${formatIDR(totalExpense)}`, 14, yPos);
    yPos += 5;
    doc.text(`Arus Bersih (Cashflow): ${formatIDR(netCashflow)}`, 14, yPos);
    yPos += 5;
    doc.text(`Total Aset (Dompet Aktif): ${formatIDR(currentWalletsTotal)}`, 14, yPos);
    yPos += 5;
    doc.text(`Total Liabilitas (Hutang Aktif): ${formatIDR(currentDebtsOwe)}`, 14, yPos);

    yPos += 12;
    doc.setFontSize(11);
    doc.text("Distribusi Kategori Pengeluaran", 14, yPos);

    yPos += 4;
    autoTable(doc, {
      startY: yPos,
      head: [["Kategori Pengeluaran", "Jumlah Dana", "Persentase"]],
      body: categoryBreakdown.map(cat => [
        cat.name,
        formatIDR(cat.amount),
        formatPercentage(cat.percentage)
      ]),
      theme: "striped",
      headStyles: { fillColor: [12, 92, 171] }
    });

    const finalY = (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY || yPos;
    const nextY = finalY + 12;

    if (nextY > 210) {
      doc.addPage();
      yPos = 20;
    } else {
      yPos = nextY;
    }

    doc.setFontSize(11);
    doc.text("Daftar Detail Transaksi Terakhir", 14, yPos);

    autoTable(doc, {
      startY: yPos + 4,
      head: [["Tanggal", "Kategori", "Deskripsi", "Tipe", "Jumlah"]],
      body: filteredTransactions.slice(-60).map(tx => [
        new Date(tx.transaction_date).toLocaleDateString("id-ID"),
        tx.categories?.name || "-",
        tx.description || "-",
        tx.type === "income" ? "Pemasukan" : "Pengeluaran",
        formatIDR(tx.amount)
      ]),
      theme: "striped",
      headStyles: { fillColor: [12, 92, 171] },
      styles: { fontSize: 8 }
    });

    doc.save(`LaporanKeuangan-${new Date().toISOString().split("T")[0]}.pdf`);
    showSuccessToast("Laporan PDF berhasil diunduh!");
  } catch (err: unknown) {
    console.error(err);
    const message = err instanceof Error ? err.message : String(err);
    showErrorToast("Gagal mengekspor PDF: " + message);
  } finally {
    setExportingPDF(false);
  }
}

interface ExportExcelProps {
  startDate: Date;
  endDate: Date;
  totalIncome: number;
  totalExpense: number;
  netCashflow: number;
  currentWalletsTotal: number;
  currentDebtsOwe: number;
  categoryBreakdown: CategoryBreakdown[];
  filteredTransactions: Transaction[];
  showSuccessToast: (msg: string) => void;
  showErrorToast: (msg: string) => void;
  setExportingExcel: (val: boolean) => void;
}

export function exportToExcel({
  startDate,
  endDate,
  totalIncome,
  totalExpense,
  netCashflow,
  currentWalletsTotal,
  currentDebtsOwe,
  categoryBreakdown,
  filteredTransactions,
  showSuccessToast,
  showErrorToast,
  setExportingExcel
}: ExportExcelProps) {
  try {
    setExportingExcel(true);
    const wb = XLSX.utils.book_new();

    // Summary sheet
    const summaryData = [
      ["LAPORAN KEUANGAN CATATUANG"],
      ["Periode Laporan", `${startDate.toLocaleDateString("id-ID")} - ${endDate.toLocaleDateString("id-ID")}`],
      [],
      ["Metrik Ringkasan Keuangan"],
      ["Total Pemasukan", totalIncome],
      ["Total Pengeluaran", totalExpense],
      ["Arus Bersih (Cashflow)", netCashflow],
      ["Total Saldo Dompet", currentWalletsTotal],
      ["Total Hutang Aktif", currentDebtsOwe],
      [],
      ["Breakdown Pengeluaran Kategori"],
      ["Kategori", "Jumlah Dana", "Persentase"],
      ...categoryBreakdown.map(cat => [cat.name, cat.amount, cat.percentage / 100])
    ];
    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, "Ringkasan Laporan");

    // Detailed Transactions sheet
    const txData = [
      ["Tanggal", "Kategori", "Deskripsi", "Dompet", "Tipe", "Jumlah Dana (IDR)"],
      ...filteredTransactions.map(tx => [
        tx.transaction_date,
        tx.categories?.name || "-",
        tx.description || "-",
        tx.wallets?.name || "-",
        tx.type === "income" ? "Pemasukan" : "Pengeluaran",
        tx.amount
      ])
    ];
    const txWs = XLSX.utils.aoa_to_sheet(txData);
    XLSX.utils.book_append_sheet(wb, txWs, "Detail Transaksi");

    XLSX.writeFile(wb, `LaporanKeuangan-${new Date().toISOString().split("T")[0]}.xlsx`);
    showSuccessToast("Laporan Excel berhasil diunduh!");
  } catch (err: unknown) {
    console.error(err);
    const message = err instanceof Error ? err.message : String(err);
    showErrorToast("Gagal mengekspor Excel: " + message);
  } finally {
    setExportingExcel(false);
  }
}

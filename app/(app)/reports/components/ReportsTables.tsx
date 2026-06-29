"use client";

import { formatIDR } from "@/lib/utils/format";

interface CashflowData {
  month: string;
  income: number;
  expense: number;
  net: number;
}

interface CategoryBreakdown {
  name: string;
  amount: number;
  color: string;
  percentage: number;
}

interface ReportsTablesProps {
  cashflowData: CashflowData[];
  categoryBreakdown: CategoryBreakdown[];
  incomeCategoryBreakdown: CategoryBreakdown[];
  formatPercentage: (val: number) => string;
}

export function ReportsTables({
  cashflowData,
  categoryBreakdown,
  incomeCategoryBreakdown,
  formatPercentage
}: ReportsTablesProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      {/* Cashflow Tabular data */}
      <div className="bg-surface-card border border-border rounded-2xl p-5 flex-1">
        <h3 className="text-xs font-bold text-text-primary mb-4 flex items-center gap-2 uppercase tracking-wider">
          Tabel Data Arus Kas Bulanan
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left" aria-label="Tabel Arus Kas Bulanan">
            <thead>
              <tr className="border-b border-border text-text-secondary uppercase tracking-wider text-[10px]">
                <th className="pb-2">Bulan</th>
                <th className="pb-2 text-right">Pemasukan</th>
                <th className="pb-2 text-right">Pengeluaran</th>
                <th className="pb-2 text-right">Net</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {cashflowData.map((row, idx) => (
                <tr key={idx} className="hover:bg-surface-hover/30">
                  <td className="py-2.5 font-bold">{row.month}</td>
                  <td className="py-2.5 text-right font-mono text-success">{formatIDR(row.income)}</td>
                  <td className="py-2.5 text-right font-mono text-danger">{formatIDR(row.expense)}</td>
                  <td className={`py-2.5 text-right font-mono font-bold ${row.net >= 0 ? "text-success" : "text-danger"}`}>
                    {formatIDR(row.net)}
                  </td>
                </tr>
              ))}
              {cashflowData.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-text-secondary">Tidak ada data arus kas.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Column - Two Category Tables */}
      <div className="space-y-6 flex-1">
        {/* Income Category breakdown Tabular data */}
        <div className="bg-surface-card border border-border rounded-2xl p-5">
          <h3 className="text-xs font-bold text-text-primary mb-4 flex items-center gap-2 uppercase tracking-wider">
            Tabel Distribusi Kategori Pemasukan
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left" aria-label="Tabel Kategori Pemasukan">
              <thead>
                <tr className="border-b border-border text-text-secondary uppercase tracking-wider text-[10px]">
                  <th className="pb-2">Nama Kategori</th>
                  <th className="pb-2 text-right">Jumlah Dana</th>
                  <th className="pb-2 text-right">Persentase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {incomeCategoryBreakdown.map((row, idx) => (
                  <tr key={idx} className="hover:bg-surface-hover/30">
                    <td className="py-2.5 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: row.color }} />
                      <span className="font-bold">{row.name}</span>
                    </td>
                    <td className="py-2.5 text-right font-mono text-text-primary">{formatIDR(row.amount)}</td>
                    <td className="py-2.5 text-right font-semibold text-text-secondary">{formatPercentage(row.percentage)}</td>
                  </tr>
                ))}
                {incomeCategoryBreakdown.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-text-secondary">Tidak ada data pemasukan.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expense Category breakdown Tabular data */}
        <div className="bg-surface-card border border-border rounded-2xl p-5">
          <h3 className="text-xs font-bold text-text-primary mb-4 flex items-center gap-2 uppercase tracking-wider">
            Tabel Distribusi Kategori Pengeluaran
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left" aria-label="Tabel Kategori Pengeluaran">
              <thead>
                <tr className="border-b border-border text-text-secondary uppercase tracking-wider text-[10px]">
                  <th className="pb-2">Nama Kategori</th>
                  <th className="pb-2 text-right">Jumlah Dana</th>
                  <th className="pb-2 text-right">Persentase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {categoryBreakdown.map((row, idx) => (
                  <tr key={idx} className="hover:bg-surface-hover/30">
                    <td className="py-2.5 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: row.color }} />
                      <span className="font-bold">{row.name}</span>
                    </td>
                    <td className="py-2.5 text-right font-mono text-text-primary">{formatIDR(row.amount)}</td>
                    <td className="py-2.5 text-right font-semibold text-text-secondary">{formatPercentage(row.percentage)}</td>
                  </tr>
                ))}
                {categoryBreakdown.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-text-secondary">Tidak ada data pengeluaran.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

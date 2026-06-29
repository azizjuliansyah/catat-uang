"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { TrendingUp, Wallet, ArrowDown, ArrowUp } from "lucide-react";
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

interface ReportsChartsProps {
  cashflowData: CashflowData[];
  categoryBreakdown: CategoryBreakdown[];
  incomeCategoryBreakdown: CategoryBreakdown[];
  chartColors: {
    income: string;
    expense: string;
    primary: string;
    netWorth: string;
  };
}

export function ReportsCharts({
  cashflowData,
  categoryBreakdown,
  incomeCategoryBreakdown,
  chartColors
}: ReportsChartsProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-6 min-w-0 items-start">
      {/* Monthly Cashflow Summary with Progress Bars */}
      <div className="bg-surface-card border border-border rounded-2xl p-5 min-w-0 flex-1">
        <h3 className="text-xs font-bold text-text-primary mb-4 flex items-center gap-2 uppercase tracking-wider">
          <TrendingUp className="w-4 h-4 text-primary" />
          Grafik Arus Kas Bulanan
        </h3>

        <div className="space-y-4">
          {cashflowData.length > 0 ? (
            cashflowData.map((data) => {
              const maxAmount = Math.max(...cashflowData.map(d => Math.max(d.income, d.expense)));
              const incomePercent = maxAmount > 0 ? (data.income / maxAmount) * 100 : 0;
              const expensePercent = maxAmount > 0 ? (data.expense / maxAmount) * 100 : 0;

              return (
                <div key={data.month} className="space-y-2 p-3 bg-surface-hover/50 rounded-xl">
                  {/* Month Header */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text-primary uppercase tracking-wide">{data.month}</span>
                  </div>

                  {/* Income Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-text-secondary">
                      <span className="flex items-center gap-1">
                        <ArrowUp className="w-3 h-3 text-income" />
                        Masuk
                      </span>
                      <span className="font-mono">{formatIDR(data.income)}</span>
                    </div>
                    <div className="h-2 bg-surface-card rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${incomePercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Expense Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-text-secondary">
                      <span className="flex items-center gap-1">
                        <ArrowDown className="w-3 h-3 text-expense" />
                        Keluar
                      </span>
                      <span className="font-mono">{formatIDR(data.expense)}</span>
                    </div>
                    <div className="h-2 bg-surface-card rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${expensePercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Sisa Uang */}
                  <div className="pt-2 mt-2 border-t border-border/50">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
                        Sisa Uang
                      </span>
                      <span className={`text-base font-mono font-bold ${data.net >= 0 ? 'text-income' : 'text-expense'}`}>
                        {data.net >= 0 ? '+' : ''}{formatIDR(data.net)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex items-center justify-center text-text-secondary text-xs py-10">
              Tidak ada data cashflow pada periode ini.
            </div>
          )}
        </div>
      </div>

      {/* Right Column - Two Donut Charts */}
      <div className="space-y-6 min-w-0 flex-1">
        {/* Income Category Distribution */}
        <div className="bg-surface-card border border-border rounded-2xl p-5 min-w-0">
          <h3 className="text-xs font-bold text-text-primary mb-4 flex items-center gap-2 uppercase tracking-wider">
            <Wallet className="w-4 h-4 text-income" />
            Distribusi Kategori Pemasukan
          </h3>
          <div className="relative h-48 w-full min-w-0">
            {incomeCategoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incomeCategoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="amount"
                    label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                    labelLine={false}
                    fontSize={9}
                  >
                    {incomeCategoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || chartColors.income} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#18181B", border: "1px solid #27272A", borderRadius: "12px" }}
                    itemStyle={{ color: "#fafafa" }}
                    formatter={(value) => typeof value === "number" ? formatIDR(value) : value}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-text-secondary text-xs">
                Tidak ada pemasukan pada periode ini.
              </div>
            )}
          </div>
        </div>

        {/* Expense Category Distribution */}
        <div className="bg-surface-card border border-border rounded-2xl p-5 min-w-0">
          <h3 className="text-xs font-bold text-text-primary mb-4 flex items-center gap-2 uppercase tracking-wider">
            <Wallet className="w-4 h-4 text-expense" />
            Distribusi Kategori Pengeluaran
          </h3>
          <div className="relative h-48 w-full min-w-0">
            {categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="amount"
                    label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                    labelLine={false}
                    fontSize={9}
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || chartColors.expense} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#18181B", border: "1px solid #27272A", borderRadius: "12px" }}
                    itemStyle={{ color: "#fafafa" }}
                    formatter={(value) => typeof value === "number" ? formatIDR(value) : value}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-text-secondary text-xs">
                Tidak ada pengeluaran pada periode ini.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

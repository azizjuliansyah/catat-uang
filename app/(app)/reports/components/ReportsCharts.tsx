"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { Wallet } from "lucide-react";
import { formatIDR } from "@/lib/utils/format";

interface CategoryBreakdown {
  name: string;
  amount: number;
  color: string;
  percentage: number;
}

interface ReportsChartsProps {
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
  categoryBreakdown,
  incomeCategoryBreakdown,
  chartColors
}: ReportsChartsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0 items-start">
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
  );
}

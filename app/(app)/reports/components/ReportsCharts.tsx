"use client";

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { TrendingUp, HelpCircle } from "lucide-react";

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
  formatIDR: (val: number) => string;
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
  formatIDR,
  chartColors
}: ReportsChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
      {/* Cashflow Chart */}
      <div className="bg-surface-card border border-border rounded-2xl p-5 min-w-0 shadow-sm">
        <h3 className="text-xs font-bold text-text-primary mb-4 flex items-center gap-2 uppercase tracking-wider">
          <TrendingUp className="w-4 h-4 text-primary" />
          Grafik Arus Kas Bulanan
        </h3>
        <div className="relative h-64 w-full min-w-0">
          {cashflowData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashflowData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                <XAxis dataKey="month" stroke="#71717A" fontSize={10} fontFamily="var(--font-space-grotesk), sans-serif" />
                <YAxis stroke="#71717A" fontSize={10} fontFamily="var(--font-space-grotesk), sans-serif" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#18181B", border: "1px solid #27272A", borderRadius: "12px" }}
                  itemStyle={{ color: "#fafafa" }}
                  labelStyle={{ color: "#a1a1aa", fontSize: "10px", fontWeight: "bold" }}
                  formatter={(value) => typeof value === "number" ? formatIDR(value) : value}
                />
                <Legend wrapperStyle={{ fontSize: "10px" }} />
                <Bar dataKey="income" name="Pemasukan" fill={chartColors.income} radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Pengeluaran" fill={chartColors.expense} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-text-secondary text-xs">
              Tidak ada data cashflow pada periode ini.
            </div>
          )}
        </div>
      </div>

      {/* Category Breakdown Chart */}
      <div className="bg-surface-card border border-border rounded-2xl p-5 min-w-0 shadow-sm">
        <h3 className="text-xs font-bold text-text-primary mb-4 flex items-center gap-2 uppercase tracking-wider">
          <HelpCircle className="w-4 h-4 text-primary" />
          Distribusi Kategori Pengeluaran
        </h3>
        <div className="relative h-64 w-full min-w-0">
          {categoryBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="amount"
                  label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || chartColors.primary} />
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

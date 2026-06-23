"use client";

import { useApp } from "@/app/providers/AppProvider";
import { ReportsHeader } from "./components/ReportsHeader";
import { PeriodFilter } from "./components/FilterBar";
import { SummaryCards } from "./components/SummaryCards";
import { ReportsCharts } from "./components/ReportsCharts";
import { ReportsTables } from "./components/ReportsTables";
import { ReportsSkeleton } from "./components/ReportsSkeleton";

import { useReportsState } from "./hooks/useReportsState";
import { useReportsHandlers } from "./hooks/useReportsHandlers";

const CHART_COLORS = {
  income: "hsl(142, 71%, 45%)", // Emerald Green
  expense: "hsl(346, 84%, 61%)", // Rose Red
  primary: "hsl(211, 86%, 45%)", // Premium Royal Blue
  netWorth: "hsl(262, 83%, 58%)", // Deep Violet
};

export default function ReportsPage() {
  const { wallets: cachedWallets, categories } = useApp();

  const {
    loading,
    errorMsg,
    transactions,
    debts,
    exportingPDF,
    exportingExcel,
    handleExportPDF,
    handleExportExcel,
  } = useReportsHandlers();

  const {
    viewMode,
    setViewMode,
    selectedCategoryId,
    setSelectedCategoryId,
    periodFilter,
    setPeriodFilter,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    startDate,
    endDate,
    filteredTransactions,
    cashflowData,
    categoryBreakdown,
    totalIncome,
    totalExpense,
    netCashflow,
    currentWalletsTotal,
    currentDebtsOwe,
  } = useReportsState(transactions, debts, cachedWallets);

  // Format Helpers
  const formatPercentage = (val: number) => {
    return val.toFixed(1) + "%";
  };

  if (loading) return <ReportsSkeleton />;

  if (errorMsg) {
    return <div className="text-center py-10 text-danger">{errorMsg}</div>;
  }

  return (
    <div className="space-y-6 font-sans">
      <ReportsHeader
        exportingExcel={exportingExcel}
        exportingPDF={exportingPDF}
        onExportExcel={() =>
          handleExportExcel({
            startDate,
            endDate,
            totalIncome,
            totalExpense,
            netCashflow,
            currentWalletsTotal,
            currentDebtsOwe,
            categoryBreakdown,
            filteredTransactions,
          })
        }
        onExportPDF={() =>
          handleExportPDF({
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
          })
        }
      />

      <PeriodFilter
        periodFilter={periodFilter}
        setPeriodFilter={setPeriodFilter}
        customStartDate={customStartDate}
        setCustomStartDate={setCustomStartDate}
        customEndDate={customEndDate}
        setCustomEndDate={setCustomEndDate}
        viewMode={viewMode}
        setViewMode={setViewMode}
        selectedCategoryId={selectedCategoryId}
        setSelectedCategoryId={setSelectedCategoryId}
        categories={categories}
      />

      <SummaryCards
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        netCashflow={netCashflow}
        currentWalletsTotal={currentWalletsTotal}
      />

      {viewMode === "visual" ? (
        <ReportsCharts
          cashflowData={cashflowData}
          categoryBreakdown={categoryBreakdown}
          chartColors={CHART_COLORS}
        />
      ) : (
        <ReportsTables
          cashflowData={cashflowData}
          categoryBreakdown={categoryBreakdown}
          formatPercentage={formatPercentage}
        />
      )}
    </div>
  );
}

"use client";

import { useApp } from "@/app/providers/AppProvider";
import {
  ReportsHeader,
  ReportsFilterBar,
  ReportsSummary,
  ReportsCharts,
  ReportsTables,
  ReportsChartsSkeleton,
  ReportsTablesSkeleton,
  ReportsCategorySummary
} from "./components";
import { useReportsState, useReportsHandlers } from "./hooks";
import { ReportsPageSkeleton } from "./page.skeleton";

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
    incomeCategoryBreakdown,
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

      <ReportsFilterBar
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

      <ReportsSummary
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        netCashflow={netCashflow}
        currentWalletsTotal={currentWalletsTotal}
        isLoading={loading}
      />

      <ReportsCategorySummary
        transactions={transactions}
        categories={categories}
        startDate={startDate}
        endDate={endDate}
        isLoading={loading}
      />

      {viewMode === "visual" ? (
        loading ? (
          <ReportsChartsSkeleton />
        ) : (
          <ReportsCharts
            categoryBreakdown={categoryBreakdown}
            incomeCategoryBreakdown={incomeCategoryBreakdown}
            chartColors={CHART_COLORS}
          />
        )
      ) : loading ? (
        <ReportsTablesSkeleton />
      ) : (
        <ReportsTables
          cashflowData={cashflowData}
          categoryBreakdown={categoryBreakdown}
          incomeCategoryBreakdown={incomeCategoryBreakdown}
          formatPercentage={formatPercentage}
        />
      )}
    </div>
  );
}

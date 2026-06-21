import { useState, useMemo } from "react";
import { Transaction, DebtData, PeriodFilterType } from "../types";

export function getLocalDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function useReportsState(
  transactions: Transaction[],
  debts: DebtData[],
  cachedWallets: any[]
) {
  // View Mode: Visual charts vs accessible tabular data tables
  const [viewMode, setViewMode] = useState<"visual" | "tabular">("visual");

  // Filter States
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilterType>("last_6_months");
  const [customStartDate, setCustomStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 5);
    d.setDate(1);
    return getLocalDateString(d);
  });
  const [customEndDate, setCustomEndDate] = useState(() => {
    return getLocalDateString(new Date());
  });

  // Filter out archived wallets
  const wallets = useMemo(() => {
    return cachedWallets.filter((w) => !w.is_archived);
  }, [cachedWallets]);

  // Get date range based on filter
  const { startDate, endDate } = useMemo(() => {
    const now = new Date();
    let start: Date;
    let end: Date;

    switch (periodFilter) {
      case "this_month":
        start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      case "last_3_months":
        start = new Date(now.getFullYear(), now.getMonth() - 2, 1, 0, 0, 0, 0);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      case "last_6_months":
        start = new Date(now.getFullYear(), now.getMonth() - 5, 1, 0, 0, 0, 0);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      case "this_year":
        start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      case "custom":
        if (customStartDate) {
          const [sYear, sMonth, sDay] = customStartDate.split("-").map(Number);
          start = new Date(sYear, sMonth - 1, sDay, 0, 0, 0, 0);
        } else {
          start = new Date(now.getFullYear(), now.getMonth() - 5, 1, 0, 0, 0, 0);
        }
        if (customEndDate) {
          const [eYear, eMonth, eDay] = customEndDate.split("-").map(Number);
          end = new Date(eYear, eMonth - 1, eDay, 23, 59, 59, 999);
        } else {
          end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        }
        break;
      default:
        start = new Date(now.getFullYear(), now.getMonth() - 5, 1, 0, 0, 0, 0);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    }

    return { startDate: start, endDate: end };
  }, [periodFilter, customStartDate, customEndDate]);

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const txDate = new Date(tx.transaction_date);
      const matchesDate = txDate >= startDate && txDate <= endDate;
      const matchesCategory =
        selectedCategoryId === "all" || tx.category_id === selectedCategoryId;
      return matchesDate && matchesCategory;
    });
  }, [transactions, startDate, endDate, selectedCategoryId]);

  // Calculate monthly cashflow
  const cashflowData = useMemo(() => {
    const monthlyMap = new Map<string, { income: number; expense: number }>();

    // Init months in range
    const current = new Date(startDate);
    while (current <= endDate) {
      const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      monthlyMap.set(key, { income: 0, expense: 0 });
      current.setMonth(current.getMonth() + 1);
    }

    filteredTransactions.forEach((tx) => {
      const key = tx.transaction_date.substring(0, 7);
      const existing = monthlyMap.get(key) || { income: 0, expense: 0 };
      if (tx.type === "income") {
        existing.income += Number(tx.amount);
      } else {
        existing.expense += Number(tx.amount);
      }
      monthlyMap.set(key, existing);
    });

    return Array.from(monthlyMap.entries()).map(([month, values]) => {
      const [year, monthNum] = month.split("-");
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "Mei",
        "Jun",
        "Jul",
        "Agu",
        "Sep",
        "Okt",
        "Nov",
        "Des",
      ];
      return {
        month: `${monthNames[parseInt(monthNum) - 1]} ${year.slice(-2)}`,
        income: values.income,
        expense: values.expense,
        net: values.income - values.expense,
      };
    });
  }, [startDate, endDate, filteredTransactions]);

  // Category breakdown for expenses
  const categoryBreakdown = useMemo(() => {
    const expenseTx = filteredTransactions.filter((tx) => tx.type === "expense");
    const categoryMap = new Map<string, { amount: number; color: string }>();

    expenseTx.forEach((tx) => {
      const catName = tx.categories?.name || "Tanpa Kategori";
      const catColor = tx.categories?.color || "#71717a";
      const existing = categoryMap.get(catName) || { amount: 0, color: catColor };
      existing.amount += Number(tx.amount);
      categoryMap.set(catName, existing);
    });

    const total = Array.from(categoryMap.values()).reduce(
      (sum, cat) => sum + cat.amount,
      0
    );

    return Array.from(categoryMap.entries())
      .map(([name, values]) => ({
        name,
        amount: values.amount,
        color: values.color,
        percentage: total > 0 ? (values.amount / total) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions]);

  // Summaries
  const { totalIncome, totalExpense, netCashflow } = useMemo(() => {
    const totalInc = filteredTransactions
      .filter((tx) => tx.type === "income")
      .reduce((sum, tx) => sum + Number(tx.amount), 0);
    const totalExp = filteredTransactions
      .filter((tx) => tx.type === "expense")
      .reduce((sum, tx) => sum + Number(tx.amount), 0);
    return {
      totalIncome: totalInc,
      totalExpense: totalExp,
      netCashflow: totalInc - totalExp,
    };
  }, [filteredTransactions]);

  const { currentWalletsTotal, currentDebtsOwe } = useMemo(() => {
    const walletsTotal = wallets.reduce((sum, w) => sum + Number(w.balance), 0);
    const debtsOwe = debts
      .filter((d) => d.type === "owe" && d.status === "unpaid")
      .reduce(
        (sum, d) => sum + (Number(d.total_amount) - Number(d.paid_amount)),
        0
      );
    return {
      currentWalletsTotal: walletsTotal,
      currentDebtsOwe: debtsOwe,
    };
  }, [wallets, debts]);

  return {
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
    wallets,
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
  };
}

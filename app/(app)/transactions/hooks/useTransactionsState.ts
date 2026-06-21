import { useState, useMemo } from "react";
import { Transaction } from "../types";

export function getLocalDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDateRange(type: string, customStart?: string, customEnd?: string) {
  const today = new Date();
  const endDate = getLocalDateString(today);
  let startDate = "";

  if (type === "1week") {
    const d = new Date();
    d.setDate(today.getDate() - 7);
    startDate = getLocalDateString(d);
  } else if (type === "2weeks") {
    const d = new Date();
    d.setDate(today.getDate() - 14);
    startDate = getLocalDateString(d);
  } else if (type === "1month") {
    const d = new Date();
    d.setMonth(today.getMonth() - 1);
    startDate = getLocalDateString(d);
  } else if (type === "3months") {
    const d = new Date();
    d.setMonth(today.getMonth() - 3);
    startDate = getLocalDateString(d);
  } else if (type === "custom") {
    startDate = customStart || endDate;
    return { startDate, endDate: customEnd || endDate };
  }

  return { startDate, endDate };
}

export function useTransactionsState(transactions: Transaction[]) {
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<"all" | "income" | "expense">("all");
  const [selectedWalletId, setSelectedWalletId] = useState<string>("all");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [dateRangeType, setDateRangeType] = useState<string>("1month");
  const [customStartDate, setCustomStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return getLocalDateString(d);
  });
  const [customEndDate, setCustomEndDate] = useState<string>(() => {
    return getLocalDateString(new Date());
  });

  // UI States
  const [showFilters, setShowFilters] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [receiptModalUrl, setReceiptModalUrl] = useState<string | null>(null);
  const [isRunTemplatesOpen, setIsRunTemplatesOpen] = useState(false);

  // Client-side filtering
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch =
        t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.categories?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        false;
      const matchesType = selectedType === "all" || t.type === selectedType;

      const matchesWallet =
        selectedWalletId === "all" ||
        (selectedWalletId.startsWith("wallet:") && t.wallet_id === selectedWalletId.replace("wallet:", "")) ||
        (selectedWalletId.startsWith("paylater:") && t.paylater_id === selectedWalletId.replace("paylater:", ""));

      const matchesCategory = selectedCategoryId === "all" || t.category_id === selectedCategoryId;

      return matchesSearch && matchesType && matchesWallet && matchesCategory;
    });
  }, [transactions, searchTerm, selectedType, selectedWalletId, selectedCategoryId]);

  const { totalIncome, totalExpense, netFlow } = useMemo(() => {
    const income = filteredTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const expense = filteredTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    return {
      totalIncome: income,
      totalExpense: expense,
      netFlow: income - expense,
    };
  }, [filteredTransactions]);

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    const groups: { [date: string]: Transaction[] } = {};
    filteredTransactions.forEach((t) => {
      const d = new Date(t.transaction_date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const date = `${year}-${month}-${day}`;

      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(t);
    });
    return groups;
  }, [filteredTransactions]);

  const uniqueDates = useMemo(() => {
    return Object.keys(groupedTransactions).sort((a, b) => b.localeCompare(a));
  }, [groupedTransactions]);

  return {
    searchTerm,
    setSearchTerm,
    selectedType,
    setSelectedType,
    selectedWalletId,
    setSelectedWalletId,
    selectedCategoryId,
    setSelectedCategoryId,
    dateRangeType,
    setDateRangeType,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    showFilters,
    setShowFilters,
    transactionToDelete,
    setTransactionToDelete,
    receiptModalUrl,
    setReceiptModalUrl,
    isRunTemplatesOpen,
    setIsRunTemplatesOpen,
    filteredTransactions,
    totalIncome,
    totalExpense,
    netFlow,
    groupedTransactions,
    uniqueDates,
  };
}

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useApp } from "@/app/providers/AppProvider";
import { Transaction } from "../types";

function getLocalDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDateRange(type: string, customStart?: string, customEnd?: string) {
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
  } else {
    // "all" - no filter
    return { startDate: "", endDate: "" };
  }

  return { startDate, endDate };
}

export function useWalletDetailState() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { user, loadingUser, wallets, loadingWallets } = useApp();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Date range filter state
  const [dateRangeType, setDateRangeType] = useState<string>("1month");
  const [customStartDate, setCustomStartDate] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return getLocalDateString(d);
  });
  const [customEndDate, setCustomEndDate] = useState<string>(() => {
    return getLocalDateString(new Date());
  });

  // Pagination state
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [datePages, setDatePages] = useState<Record<string, number>>({});

  const wallet = wallets.find((w) => w.id === id) ?? null;

  const loadTransactions = useCallback(async () => {
    if (!user || !id) return;
    setLoading(true);
    try {
      let query = supabase
        .from("transactions")
        .select(
          "*, wallets(name, icon, color), paylater_platforms(name, color, icon), categories(name, icon, color)"
        )
        .eq("user_id", user.id)
        .eq("wallet_id", id)
        .order("transaction_date", { ascending: false });

      // Apply date range filter
      const { startDate, endDate } = getDateRange(dateRangeType, customStartDate, customEndDate);
      if (startDate && endDate) {
        query = query.gte("transaction_date", startDate).lte("transaction_date", endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTransactions((data as unknown as Transaction[]) || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user, id, supabase, dateRangeType, customStartDate, customEndDate]);

  useEffect(() => {
    if (!loadingUser) {
      if (!user) {
        router.push("/login");
      } else {
        loadTransactions();
      }
    }
  }, [user, loadingUser, loadTransactions, router]);

  // Compute Stats
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);
  const netFlow = totalIncome - totalExpense;

  // Group Transactions by Date
  const groupedTransactions = useMemo(() => {
    const groups: { [date: string]: Transaction[] } = {};
    transactions.forEach((tx) => {
      const d = new Date(tx.transaction_date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const date = `${year}-${month}-${day}`;
      if (!groups[date]) groups[date] = [];
      groups[date].push(tx);
    });
    return groups;
  }, [transactions]);

  const uniqueDates = useMemo(() => {
    return Object.keys(groupedTransactions).sort((a, b) => b.localeCompare(a));
  }, [groupedTransactions]);

  // Pagination helpers
  const getDatePage = useCallback((date: string) => datePages[date] || 1, [datePages]);
  const setDatePage = useCallback((date: string, page: number) => {
    setDatePages(prev => ({ ...prev, [date]: page }));
  }, []);

  const getDatePaginatedTransactions = useCallback((date: string): Transaction[] => {
    const dayTransactions = groupedTransactions[date] || [];
    const page = getDatePage(date);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return dayTransactions.slice(startIndex, endIndex);
  }, [groupedTransactions, getDatePage, itemsPerPage]);

  const getDateTotalPages = useCallback((date: string): number => {
    const dayTransactions = groupedTransactions[date] || [];
    return Math.ceil(dayTransactions.length / itemsPerPage);
  }, [groupedTransactions, itemsPerPage]);

  const isPageLoading = loadingUser || loadingWallets || loading;

  return {
    router,
    id,
    wallet,
    user,
    transactions,
    selectedTransaction,
    setSelectedTransaction,
    isDetailModalOpen,
    setIsDetailModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    isDeleteSubmitting,
    setIsDeleteSubmitting,
    isActionLoading,
    setIsActionLoading,
    totalIncome,
    totalExpense,
    netFlow,
    groupedTransactions,
    uniqueDates,
    isPageLoading,
    // Date filter
    dateRangeType,
    setDateRangeType,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    // Pagination
    itemsPerPage,
    setItemsPerPage,
    getDatePage,
    setDatePage,
    getDatePaginatedTransactions,
    getDateTotalPages,
  };
}

export type WalletDetailState = ReturnType<typeof useWalletDetailState>;

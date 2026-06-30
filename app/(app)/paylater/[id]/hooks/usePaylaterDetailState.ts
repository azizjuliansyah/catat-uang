/**
 * PayLater Detail Page State Management Hook
 * Handles all state for the paylater detail page
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useApp } from "@/app/providers/AppProvider";
import { useToast } from "@/components/ui/molecules/Toast";
import { fetchPaylaterDetail } from "../../services";
import { PaylaterPlatform, PaylaterTransaction, PaylaterPayment } from "../../types";

export function usePaylaterDetailState() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { user, loadingUser } = useApp();
  const { error: showErrorToast } = useToast();

  // Main Data State
  const [platform, setPlatform] = useState<PaylaterPlatform | null>(null);
  const [transactions, setTransactions] = useState<PaylaterTransaction[]>([]);
  const [payments, setPayments] = useState<PaylaterPayment[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<PaylaterPayment | null>(null);
  const [selectedTransactionIds, setSelectedTransactionIds] = useState<Set<string>>(new Set());
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Fetch data
  const loadData = useCallback(async () => {
    if (!id || !user) return;
    setLoading(true);
    try {
      const { platform: platformData, transactions: transactionsData, payments: paymentsData } =
        await fetchPaylaterDetail(supabase, id, user.id);

      if (!platformData) {
        showErrorToast("Platform Paylater tidak ditemukan.");
        router.push("/paylater");
        return;
      }

      setPlatform(platformData);
      setTransactions(transactionsData);
      setPayments(paymentsData);

    } catch (err: unknown) {
      console.error(err);
      showErrorToast("Gagal memuat data detail.");
    } finally {
      setLoading(false);
    }
  }, [id, user, supabase, router, showErrorToast]);

  useEffect(() => {
    if (!loadingUser) {
      if (!user) {
        router.push("/login");
      } else {
        loadData();
      }
    }
  }, [user, loadingUser, loadData, router]);

  // Toggle transaction selection
  const toggleTransactionSelection = (transactionId: string) => {
    setSelectedTransactionIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(transactionId)) {
        newSet.delete(transactionId);
      } else {
        newSet.add(transactionId);
      }
      return newSet;
    });
  };

  // Select all unpaid transactions
  const selectAllTransactions = () => {
    const allIds = new Set(transactions.map(t => t.id));
    setSelectedTransactionIds(allIds);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedTransactionIds(new Set());
  };

  return {
    // State
    platform,
    transactions,
    payments,
    loading,
    user,

    // Modal States
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    paymentToDelete,
    setPaymentToDelete,
    selectedTransactionIds,
    setSelectedTransactionIds,
    isEditModalOpen,
    setIsEditModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    isActionLoading,
    setIsActionLoading,

    // Actions
    loadData,
    toggleTransactionSelection,
    selectAllTransactions,
    clearSelection
  };
}

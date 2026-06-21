/**
 * Edit Transaction Page State Hook
 */

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useApp } from "@/app/providers/AppProvider";
import { useToast } from "@/components/ui/molecules/Toast";
import { formatForDateTimeInput } from "@/lib/utils/date";
import { TransactionType } from "../types";

export function useEditTransactionState() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { error: showErrorToast } = useToast();
  const {
    user,
    loadingUser,
    wallets,
    loadingWallets,
    categories,
    loadingCategories,
    paylaterPlatforms,
    loadingPaylaterPlatforms,
    refreshWallets,
    refreshPaylaterPlatforms
  } = useApp();

  const [loadingTx, setLoadingTx] = useState(true);
  const loading = loadingUser || loadingWallets || loadingCategories || loadingPaylaterPlatforms || loadingTx;

  // Form States
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<TransactionType>("expense");
  const [sourceId, setSourceId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [transactionDate, setTransactionDate] = useState("");
  const [existingReceiptUrl, setExistingReceiptUrl] = useState<string | null>(null);

  // Receipt Upload States
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [shouldDeleteExistingReceipt, setShouldDeleteExistingReceipt] = useState(false);

  // UI States
  const [submitting, setSubmitting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Load transaction data
  useEffect(() => {
    async function loadTransaction() {
      if (!id || !user) return;
      setLoadingTx(true);
      try {
        const { data: tx, error: txError } = await supabase
          .from("transactions")
          .select("*")
          .eq("id", id)
          .eq("user_id", user.id)
          .single();

        if (txError || !tx) {
          showErrorToast("Transaksi tidak ditemukan.");
          router.push("/transactions");
          return;
        }

        setAmount(tx.amount.toString());
        setType(tx.type);
        if (tx.wallet_id) {
          setSourceId(`wallet:${tx.wallet_id}`);
        } else if (tx.paylater_id) {
          setSourceId(`paylater:${tx.paylater_id}`);
        } else {
          setSourceId("");
        }
        setCategoryId(tx.categoryId || tx.category_id || "");
        setDescription(tx.description || "");
        setTransactionDate(formatForDateTimeInput(tx.transaction_date));
        setExistingReceiptUrl(tx.receipt_url);
      } catch (err: unknown) {
        console.error("Error loading transaction:", err);
        showErrorToast("Gagal mengambil data transaksi.");
      } finally {
        setLoadingTx(false);
      }
    }

    if (!loadingUser) {
      if (!user) {
        router.push("/login");
      } else {
        loadTransaction();
      }
    }
  }, [supabase, user, loadingUser, id, router, showErrorToast]);

  // Keep category in sync with type
  useEffect(() => {
    const typeCategories = categories.filter((c) => c.type === type);
    if (typeCategories.length > 0) {
      const currentCat = categories.find((c) => c.id === categoryId);
      if (!currentCat || currentCat.type !== type) {
        setCategoryId(typeCategories[0].id);
      }
    } else {
      setCategoryId("");
    }
  }, [type, categories, categoryId]);

  return {
    id,
    user,
    supabase,
    router,
    wallets,
    categories,
    paylaterPlatforms,
    refreshWallets,
    refreshPaylaterPlatforms,

    // Loading states
    loading,
    loadingTx,

    // Form states
    amount,
    setAmount,
    type,
    setType,
    sourceId,
    setSourceId,
    categoryId,
    setCategoryId,
    description,
    setDescription,
    transactionDate,
    setTransactionDate,
    existingReceiptUrl,
    setExistingReceiptUrl,

    // Receipt states
    receiptFile,
    setReceiptFile,
    receiptPreview,
    setReceiptPreview,
    uploadingReceipt,
    setUploadingReceipt,
    shouldDeleteExistingReceipt,
    setShouldDeleteExistingReceipt,

    // UI states
    submitting,
    setSubmitting,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    deleting,
    setDeleting
  };
}

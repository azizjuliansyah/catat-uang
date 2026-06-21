import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/providers/AppProvider";
import { getNowDateTimeString } from "@/lib/utils/date";

export function useNewTransactionState() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);

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

  const loading = loadingUser || loadingWallets || loadingCategories || loadingPaylaterPlatforms;

  // Form States
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [sourceId, setSourceId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [transactionDate, setTransactionDate] = useState(() => {
    return getNowDateTimeString(); // YYYY-MM-DDTHH:MM local
  });

  // Receipt Upload States
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loadingUser && !user) {
      router.push("/login");
    }
  }, [user, loadingUser, router]);

  // Pre-select default wallet
  useEffect(() => {
    if (!loadingWallets && wallets.length > 0 && !sourceId) {
      const activeWallets = wallets.filter((w) => !w.is_archived);
      const defaultWallet = activeWallets.find((w) => w.is_default);
      if (defaultWallet) {
        setSourceId(`wallet:${defaultWallet.id}`);
      } else if (activeWallets.length > 0) {
        setSourceId(`wallet:${activeWallets[0].id}`);
      }
    }
  }, [wallets, loadingWallets, sourceId]);

  // Pre-select category when type changes
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
    router,
    fileInputRef,
    amountInputRef,
    user,
    wallets,
    categories,
    paylaterPlatforms,
    refreshWallets,
    refreshPaylaterPlatforms,
    loading,
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
    receiptFile,
    setReceiptFile,
    receiptPreview,
    setReceiptPreview,
    uploadingReceipt,
    setUploadingReceipt,
    submitting,
    setSubmitting
  };
}

export type NewTransactionState = ReturnType<typeof useNewTransactionState>;

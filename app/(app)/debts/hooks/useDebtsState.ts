import { useState, useEffect } from "react";
import { DebtItem, DebtPackage } from "../types";
import { getTodayDate } from "../utils";
import { formatForDateTimeInput, getNowDateTimeString } from "@/lib/utils/date";

export function useDebtsState(wallets: any[]) {
  // Data States
  const [debts, setDebts] = useState<DebtItem[]>([]);
  const [loadingDebts, setLoadingDebts] = useState(true);
  const [activeTab, setActiveTab] = useState<"owe" | "lend">("owe");
  const [subTab, setSubTab] = useState<"active" | "settled">("active");
  const [searchTerm, setSearchTerm] = useState("");

  // Modals States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [debtToDelete, setDebtToDelete] = useState<DebtItem | null>(null);
  const [paymentToDelete, setPaymentToDelete] = useState<any>(null);

  // Form States - Add/Edit Debt
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<"owe" | "lend">("owe");
  const [formPackages, setFormPackages] = useState<DebtPackage[]>([
    { id: "1", totalAmount: "", dueDate: "", description: "", proofFiles: null, proofPreviews: null, existingProofUrls: null, shouldDeleteProofUrls: null, createdAt: getNowDateTimeString() }
  ]);
  const [editingDebt, setEditingDebt] = useState<DebtItem | null>(null);
  const [submittingDebt, setSubmittingDebt] = useState(false);

  // Form States - Pay Debt
  const [payingDebt, setPayingDebt] = useState<DebtItem | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payWalletId, setPayWalletId] = useState("");
  const [payDate, setPayDate] = useState(getTodayDate());
  const [payProofFiles, setPayProofFiles] = useState<File[] | null>(null);
  const [payProofPreviews, setPayProofPreviews] = useState<string[] | null>(null);
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);
  const [isPayDeleteSubmitting, setIsPayDeleteSubmitting] = useState(false);

  // Set default wallet ID when wallets change
  useEffect(() => {
    if (wallets.length > 0 && !payWalletId) {
      const activeWallets = wallets.filter((w: any) => !w.is_archived);
      const defaultWallet = activeWallets.find((w: any) => w.is_default) || activeWallets[0];
      if (defaultWallet) {
        setPayWalletId(defaultWallet.id);
      }
    }
  }, [wallets, payWalletId]);

  // Filtered debts
  const filteredDebts = debts.filter((item) => {
    const matchesTab = item.type === activeTab;
    const matchesSubTab = subTab === "active" ? item.status === "unpaid" : item.status === "paid";
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.debt_transactions?.some(t => t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase())));
    return matchesTab && matchesSubTab && matchesSearch;
  });

  const resetDebtForm = () => {
    setFormName("");
    setFormType("owe");
    setFormPackages([
      { id: Math.random().toString(), totalAmount: "", dueDate: "", description: "", proofFiles: null, proofPreviews: null, existingProofUrls: null, shouldDeleteProofUrls: null, createdAt: getNowDateTimeString() }
    ]);
    setEditingDebt(null);
  };

  const openEditModal = (item: DebtItem) => {
    setEditingDebt(item);
    setFormName(item.name);
    setFormType(item.type);
    if (item.debt_transactions && item.debt_transactions.length > 0) {
      setFormPackages(
        item.debt_transactions.map((t) => ({
          id: t.id,
          totalAmount: t.amount.toString(),
          dueDate: t.due_date ? formatForDateTimeInput(t.due_date) : "",
          description: t.description || "",
          proofFiles: null,
          proofPreviews: null,
          existingProofUrls: t.debt_transaction_proofs?.map(p => p.proof_url) || null,
          shouldDeleteProofUrls: null,
          createdAt: t.created_at ? formatForDateTimeInput(t.created_at) : getNowDateTimeString()
        }))
      );
    } else {
      setFormPackages([
        { id: Math.random().toString(), totalAmount: "", dueDate: "", description: "", proofFiles: null, proofPreviews: null, existingProofUrls: null, shouldDeleteProofUrls: null, createdAt: getNowDateTimeString() }
      ]);
    }
    setIsEditModalOpen(true);
  };

  const openPayModal = (item: DebtItem) => {
    setPayingDebt(item);
    const remaining = item.total_amount - item.paid_amount;
    setPayAmount(remaining.toString());
    setPayDate(getTodayDate());
    setPayProofFiles(null);
    setPayProofPreviews(null);
    setIsPayModalOpen(true);
  };

  const openAddModal = () => {
    resetDebtForm();
    setFormType(activeTab);
    setIsAddModalOpen(true);
  };

  return {
    // Data
    debts,
    setDebts,
    loadingDebts,
    setLoadingDebts,
    activeTab,
    setActiveTab,
    subTab,
    setSubTab,
    searchTerm,
    setSearchTerm,
    filteredDebts,

    // Modals
    isAddModalOpen,
    setIsAddModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isPayModalOpen,
    setIsPayModalOpen,
    isHistoryModalOpen,
    setIsHistoryModalOpen,
    debtToDelete,
    setDebtToDelete,
    paymentToDelete,
    setPaymentToDelete,

    // Form - Debt
    formName,
    setFormName,
    formType,
    setFormType,
    formPackages,
    setFormPackages,
    editingDebt,
    setEditingDebt,
    submittingDebt,
    setSubmittingDebt,

    // Form - Payment
    payingDebt,
    setPayingDebt,
    payAmount,
    setPayAmount,
    payWalletId,
    setPayWalletId,
    payDate,
    setPayDate,
    payProofFiles,
    setPayProofFiles,
    payProofPreviews,
    setPayProofPreviews,
    submittingPayment,
    setSubmittingPayment,

    // Delete
    isDeleteSubmitting,
    setIsDeleteSubmitting,
    isPayDeleteSubmitting,
    setIsPayDeleteSubmitting,

    // Actions
    resetDebtForm,
    openEditModal,
    openPayModal,
    openAddModal
  };
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/providers/AppProvider";
import { useToast } from "@/components/ui/molecules/Toast";

// Import new components
import { DebtDetailHeader } from "./components/DebtDetailHeader";
import { DebtProgressStats } from "./components/DebtProgressStats";
import { DebtTransactionList } from "./components/DebtTransactionList";
import { DebtPaymentList } from "./components/DebtPaymentList";
import { DebtEmptyState } from "./components/DebtEmptyState";
import { useDebtDetailState } from "./hooks/useDebtDetailState";
import { useDebtDetailHandlers } from "./hooks/useDebtDetailHandlers";

// Import existing modals
import { DebtFormModal } from "../components/modals/DebtFormModal";
import { PaymentModal } from "../components/modals/PaymentModal";
import { DeleteDebtModal } from "../components/modals/DeleteDebtModal";
import { DeletePaymentModal } from "../components/modals/DeletePaymentModal";

// Import types
import type { DebtItem, DebtPaymentItem } from "./types";

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null && "message" in err) {
    return (err as any).message;
  }
  return "Unknown error";
}

export default function DebtDetailPage() {
  const router = useRouter();
  const { wallets, refreshWallets } = useApp();
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  // Use custom hooks for state and handlers
  const state = useDebtDetailState();

  const {
    debt,
    payments,
    loading,
    isEditModalOpen,
    setIsEditModalOpen,
    isPayModalOpen,
    setIsPayModalOpen,
    showDeleteDebtModal,
    setShowDeleteDebtModal,
    paymentToDelete,
    setPaymentToDelete,
    formName,
    setFormName,
    formType,
    setFormType,
    formPackages,
    setFormPackages,
    isSavingDebt,
    setIsSavingDebt,
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
    isSavingPayment,
    setIsSavingPayment,
    isDeletingDebt,
    setIsDeletingDebt,
    isDeletingPayment,
    setIsDeletingPayment,
    openEditModal
  } = state;

  const handlers = useDebtDetailHandlers({
    debt,
    user: state.user,
    formName,
    formType,
    formPackages,
    payAmount,
    payWalletId,
    payDate,
    payProofFiles,
    paymentToDelete,
    isSavingDebt,
    isSavingPayment,
    isDeletingDebt,
    isDeletingPayment,
    setIsSavingDebt,
    setIsSavingPayment,
    setIsDeletingDebt,
    setIsDeletingPayment,
    setIsEditModalOpen,
    setIsPayModalOpen,
    setPaymentToDelete,
    setPayAmount,
    setPayProofFiles,
    setPayProofPreviews,
    loadData: state.loadData,
    refreshWallets
  });

  const {
    handleSaveDebt,
    handleRecordPayment,
    handleDeleteDebt,
    handleDeletePayment
  } = handlers;

  if (loading || !debt) {
    return <DebtEmptyState />;
  }

  const isOwe = debt.type === "owe";

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header Section */}
      <DebtDetailHeader
        debt={debt}
        onEdit={openEditModal}
        onDelete={() => setShowDeleteDebtModal(true)}
      />

      {/* Progress Stats */}
      <DebtProgressStats debt={debt} />

      {/* Transaction Groups and Payment History */}
      <div className="space-y-6">
        {/* Transaction Groups */}
        <DebtTransactionList
          transactions={debt.debt_transactions || []}
          debtStatus={debt.status}
        />

        {/* Payment History */}
        <DebtPaymentList
          payments={payments}
          debtStatus={debt.status}
          debtType={debt.type}
          onRecordPayment={() => setIsPayModalOpen(true)}
          onDeletePayment={(payment) => setPaymentToDelete(payment)}
        />
      </div>

      {/* Modals */}
      <DebtFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleSaveDebt}
        isEdit={true}
        formType={formType}
        setFormType={setFormType}
        formName={formName}
        setFormName={setFormName}
        formPackages={formPackages}
        setFormPackages={setFormPackages}
        isSubmitting={isSavingDebt}
        editingDebt={debt}
      />

      <PaymentModal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        onSubmit={handleRecordPayment}
        payingDebt={debt}
        payAmount={payAmount}
        setPayAmount={setPayAmount}
        payWalletId={payWalletId}
        setPayWalletId={setPayWalletId}
        payDate={payDate}
        setPayDate={setPayDate}
        payProofFiles={payProofFiles}
        setPayProofFiles={setPayProofFiles}
        payProofPreviews={payProofPreviews}
        setPayProofPreviews={setPayProofPreviews}
        isSubmitting={isSavingPayment}
        wallets={wallets}
      />

      <DeleteDebtModal
        isOpen={showDeleteDebtModal}
        onClose={() => setShowDeleteDebtModal(false)}
        debtToDelete={debt}
        onConfirm={handleDeleteDebt}
        isSubmitting={isDeletingDebt}
      />

      <DeletePaymentModal
        isOpen={paymentToDelete !== null}
        onClose={() => setPaymentToDelete(null)}
        paymentToDelete={paymentToDelete}
        onConfirm={handleDeletePayment}
        isSubmitting={isDeletingPayment}
      />
    </div>
  );
}

"use client";

import { useApp } from "@/app/providers/AppProvider";
import { useDebtDetailState, useDebtDetailHandlers } from "./hooks";
import {
  DebtDetailHeader,
  DebtDetailSummary,
  DebtTransactionList,
  DebtPaymentList,
  DebtDetailLoading
} from "./components";
import { DebtFormModal, PaymentModal, DeleteDebtModal, DeletePaymentModal } from "../components";

export default function DebtDetailPage() {
  const { wallets, refreshWallets } = useApp();
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

  if (loading && !debt) {
    return <DebtDetailLoading />;
  }

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header Section */}
      <DebtDetailHeader
        debt={debt || null}
        isLoading={loading}
        onEdit={openEditModal}
        onDelete={() => setShowDeleteDebtModal(true)}
      />

      {/* Progress Stats / Summary */}
      <DebtDetailSummary debt={debt || null} isLoading={loading} />

      {/* Transaction Groups and Payment History */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Transaction Groups */}
        <div className="flex-1">
          <DebtTransactionList
            transactions={debt?.debt_transactions || []}
            debtStatus={debt?.status || "unpaid"}
          />
        </div>

        {/* Payment History */}
        <div className="flex-1">
          <DebtPaymentList
            payments={payments}
            debtStatus={debt?.status || "unpaid"}
            debtType={debt?.type || "owe"}
            onRecordPayment={() => setIsPayModalOpen(true)}
            onDeletePayment={(payment) => setPaymentToDelete(payment)}
          />
        </div>
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
        editingDebt={debt || undefined}
      />

      <PaymentModal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        onSubmit={handleRecordPayment}
        payingDebt={debt!}
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
        debtToDelete={debt!}
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

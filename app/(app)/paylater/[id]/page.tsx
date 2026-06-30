"use client";

import { useRouter } from "next/navigation";
import { usePaylaterDetailState, usePaylaterDetailHandlers } from "./hooks";
import {
  PaylaterDetailHeader,
  PaylaterDetailSummary,
  PaylaterTransactionList,
  PaylaterTransactionListSkeleton,
  PaylaterPaymentList,
  PaylaterPaymentListSkeleton
} from "./components";
import { PaylaterPaymentModal, DeletePaylaterPaymentModal, PaylaterModal, DeletePaylaterModal } from "../components";
import { getNextBillingDate } from "../utils";

export default function PaylaterDetailPage() {
  const router = useRouter();
  const state = usePaylaterDetailState();

  const {
    platform,
    transactions,
    payments,
    loading,
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    paymentToDelete,
    setPaymentToDelete,
    selectedTransactionIds,
    toggleTransactionSelection,
    selectAllTransactions,
    clearSelection,
    isEditModalOpen,
    setIsEditModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    isActionLoading,
    setIsActionLoading,
  } = state;

  const handlers = usePaylaterDetailHandlers({
    paymentToDelete,
    setPaymentToDelete,
    loadData: state.loadData,
    platform,
    setIsEditModalOpen,
    setIsDeleteModalOpen,
    setIsActionLoading
  });

  const {
    handlePaymentSuccess,
    handleDeletePayment,
    handleToggleArchive,
    handleEditSuccess,
    handleDeleteSuccess
  } = handlers;

  const nextDates = platform ? getNextBillingDate(platform) : null;

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header Section */}
      <PaylaterDetailHeader
        platform={platform}
        nextBillingDates={nextDates}
        isLoading={loading}
        onEdit={() => setIsEditModalOpen(true)}
        onToggleArchive={handleToggleArchive}
        onDelete={() => setIsDeleteModalOpen(true)}
      />

      {/* Progress & Info Section */}
      <PaylaterDetailSummary
        platform={platform}
        nextDates={nextDates}
        isLoading={loading}
      />

      <div className="flex flex-col md:flex-row gap-4 items-start">
        {/* Transactions Section */}
        <div className="flex-1">
          {loading ? (
            <PaylaterTransactionListSkeleton />
          ) : platform ? (
            <PaylaterTransactionList
              platform={platform}
              transactions={transactions}
              selectedTransactionIds={selectedTransactionIds}
              toggleTransactionSelection={toggleTransactionSelection}
              selectAllTransactions={selectAllTransactions}
              clearSelection={clearSelection}
              setIsPaymentModalOpen={setIsPaymentModalOpen}
            />
          ) : null}
        </div>

        {/* Payment History Section */}
        <div className="flex-1">
          {loading ? (
            <PaylaterPaymentListSkeleton />
          ) : platform ? (
            <PaylaterPaymentList
              platform={platform}
              payments={payments}
              setIsPaymentModalOpen={setIsPaymentModalOpen}
              setPaymentToDelete={setPaymentToDelete}
            />
          ) : null}
        </div>
      </div>

      {/* Modals */}
      <PaylaterPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          state.setSelectedTransactionIds(new Set());
        }}
        platform={platform}
        selectedTransactionIds={selectedTransactionIds}
        transactions={transactions}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <DeletePaylaterPaymentModal
        isOpen={paymentToDelete !== null}
        onClose={() => setPaymentToDelete(null)}
        paymentToDelete={paymentToDelete}
        onConfirm={handleDeletePayment}
      />

      {/* Edit Platform Modal */}
      <PaylaterModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        editingPlatform={platform}
        onSaveSuccess={handleEditSuccess}
      />

      {/* Delete Platform Modal */}
      <DeletePaylaterModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        platformToDelete={platform}
        onDeleteSuccess={() => handleDeleteSuccess(router)}
      />
    </div>
  );
}

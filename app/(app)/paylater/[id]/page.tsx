"use client";

import { usePaylaterDetailState } from "./hooks/usePaylaterDetailState";
import { usePaylaterDetailHandlers } from "./hooks/usePaylaterDetailHandlers";

// Import components
import { PaylaterDetailHeader } from "./components/PaylaterDetailHeader";
import { PaylaterProgressStats } from "./components/PaylaterProgressStats";
import { PaylaterTransactionList } from "./components/PaylaterTransactionList";
import { PaylaterPaymentList } from "./components/PaylaterPaymentList";

// Import modals
import { PaylaterPaymentModal } from "../components/PaylaterPaymentModal";
import { DeletePaylaterPaymentModal } from "../components/DeletePaylaterPaymentModal";

import { formatDateTimeLong } from "@/lib/utils/date";

export default function PaylaterDetailPage() {
  const state = usePaylaterDetailState();
  const handlers = usePaylaterDetailHandlers({
    paymentToDelete: state.paymentToDelete,
    setPaymentToDelete: state.setPaymentToDelete,
    loadData: state.loadData
  });

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
    clearSelection
  } = state;

  const {
    handlePaymentSuccess,
    handleDeletePayment
  } = handlers;

  if (loading || !platform) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-text-secondary font-sans">Memuat detail paylater...</p>
      </div>
    );
  }

  // Calculate next billing and due dates
  const getNextBillingDate = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const billingDay = platform.billing_cycle_date;

    let thisMonthBilling = new Date(currentYear, currentMonth, billingDay);
    if (thisMonthBilling < today) {
      thisMonthBilling = new Date(currentYear, currentMonth + 1, billingDay);
    }

    const dueDate = new Date(thisMonthBilling);
    dueDate.setDate(dueDate.getDate() + platform.due_date_offset);

    return {
      billing: formatDateTimeLong(thisMonthBilling.toISOString()),
      due: formatDateTimeLong(dueDate.toISOString())
    };
  };

  const nextDates = getNextBillingDate();

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header Section */}
      <PaylaterDetailHeader
        platform={platform}
        nextBillingDates={nextDates}
      />

      {/* Progress & Info Section */}
      <PaylaterProgressStats
        platform={platform}
        nextDates={nextDates}
      />

      {/* Transactions Section */}
      <PaylaterTransactionList
        platform={platform}
        transactions={transactions}
        selectedTransactionIds={selectedTransactionIds}
        toggleTransactionSelection={toggleTransactionSelection}
        selectAllTransactions={selectAllTransactions}
        clearSelection={clearSelection}
        setIsPaymentModalOpen={setIsPaymentModalOpen}
      />

      {/* Payment History Section */}
      <PaylaterPaymentList
        platform={platform}
        payments={payments}
        setIsPaymentModalOpen={setIsPaymentModalOpen}
        setPaymentToDelete={setPaymentToDelete}
      />

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
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/molecules/Toast";

import { usePaylaterDetailState } from "./hooks/usePaylaterDetailState";
import { usePaylaterDetailHandlers } from "./hooks/usePaylaterDetailHandlers";

// Import components
import { PaylaterDetailHeader } from "./components/PaylaterDetailHeader";
import { PaylaterProgressStats } from "./components/PaylaterProgressStats";
import { PaylaterTransactionList } from "./components/PaylaterTransactionList";
import { PaylaterTransactionListSkeleton } from "./components/PaylaterTransactionListSkeleton";
import { PaylaterPaymentList } from "./components/PaylaterPaymentList";
import { PaylaterPaymentListSkeleton } from "./components/PaylaterPaymentListSkeleton";

// Import modals
import { PaylaterPaymentModal } from "../components/PaylaterPaymentModal";
import { DeletePaylaterPaymentModal } from "../components/DeletePaylaterPaymentModal";
import { PaylaterModal } from "../components/PaylaterModal";
import { DeletePaylaterModal } from "../components/DeletePaylaterModal";

import { getNextBillingDate } from "../utils";
import { toggleArchivePaylaterPlatform } from "../services";

export default function PaylaterDetailPage() {
  const router = useRouter();
  const supabase = createClient();
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  const state = usePaylaterDetailState();
  const handlers = usePaylaterDetailHandlers({
    paymentToDelete: state.paymentToDelete,
    setPaymentToDelete: state.setPaymentToDelete,
    loadData: state.loadData,
  });

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

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
  } = state;

  const { handlePaymentSuccess, handleDeletePayment } = handlers;

  const nextDates = platform ? getNextBillingDate(platform) : null;

  // Archive/Unarchive handler
  const handleToggleArchive = async () => {
    if (!platform) return;
    setIsActionLoading(true);
    try {
      const nextArchived = !platform.is_archived;
      await toggleArchivePaylaterPlatform(supabase, platform.id, nextArchived);
      showSuccessToast(nextArchived ? "Platform berhasil diarsipkan" : "Platform berhasil diaktifkan kembali");
      // Refresh data
      state.loadData();
    } catch (err) {
      console.error(err);
      showErrorToast("Gagal mengubah status arsip platform");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handlers for modals
  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    state.loadData();
  };

  const handleDeleteSuccess = () => {
    setIsDeleteModalOpen(false);
    router.push("/paylater");
  };

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
      <PaylaterProgressStats
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
        onDeleteSuccess={handleDeleteSuccess}
      />
    </div>
  );
}

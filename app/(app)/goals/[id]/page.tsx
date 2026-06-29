"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/molecules/Toast";

// Import new components
import { GoalDetailHeader } from "./components/GoalDetailHeader";
import { GoalProgressSection } from "./components/GoalProgressSection";
import { GoalDeadlineEstimation } from "./components/GoalDeadlineEstimation";
import { GoalTransactionList } from "./components/GoalTransactionList";
import { GoalEmptyState } from "./components/GoalEmptyState";
import { GoalDetailModals } from "./components/GoalDetailModals";
import { useGoalDetailState } from "./hooks/useGoalDetailState";
import { useGoalDetailHandlers } from "./hooks/useGoalDetailHandlers";
import { calculateETAInfo } from "../utils";
import { ETAInfo } from "../types";

export default function GoalDetailPage() {
  const supabase = createClient();
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Use custom hooks for state and handlers
  const state = useGoalDetailState();

  const {
    goal,
    transactions,
    loading,
    isEditModalOpen,
    setIsEditModalOpen,
    isTopupModalOpen,
    setIsTopupModalOpen,
    isWithdrawModalOpen,
    setIsWithdrawModalOpen,
    showDeleteGoalModal,
    setShowDeleteGoalModal,
    transactionToDelete,
    setTransactionToDelete,
    formName,
    formTargetAmount,
    formTargetDate,
    formIcon,
    txAmount,
    txWalletId,
    txDate,
    isSavingGoal,
    setIsSavingGoal,
    isSavingTx,
    setIsSavingTx,
    isDeletingGoal,
    setIsDeletingGoal,
    isDeletingTx,
    setIsDeletingTx,
    openEditModal
  } = state;

  const handlers = useGoalDetailHandlers({
    goal,
    user: state.user,
    formName,
    formTargetAmount,
    formTargetDate,
    formIcon,
    txAmount,
    txWalletId,
    txDate,
    transactionToDelete,
    isSavingGoal,
    isSavingTx,
    isDeletingGoal,
    isDeletingTx,
    setIsSavingGoal,
    setIsSavingTx,
    setIsDeletingGoal,
    setIsDeletingTx,
    setIsEditModalOpen,
    setIsTopupModalOpen,
    setIsWithdrawModalOpen,
    setTransactionToDelete,
    loadData: state.loadData
  });

  // Mark Complete handler
  const handleMarkComplete = async () => {
    if (!goal || goal.status === "achieved" || goal.status === "withdrawn") return;
    setIsActionLoading(true);
    try {
      const { error } = await supabase
        .from("saving_goals")
        .update({ status: "achieved" })
        .eq("id", goal.id);

      if (error) throw error;
      showSuccessToast(`Tujuan "${goal.name}" berhasil ditandai selesai!`);
      state.loadData();
    } catch (err) {
      console.error(err);
      showErrorToast("Gagal menandai tujuan sebagai selesai");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Toggle Archive handler
  const handleToggleArchive = async () => {
    if (!goal) return;
    setIsActionLoading(true);
    try {
      const nextArchived = !goal.is_archived;
      const { error } = await supabase
        .from("saving_goals")
        .update({ is_archived: nextArchived })
        .eq("id", goal.id);

      if (error) throw error;
      showSuccessToast(nextArchived ? "Tujuan berhasil diarsipkan" : "Tujuan berhasil diaktifkan kembali");
      state.loadData();
    } catch (err) {
      console.error(err);
      showErrorToast("Gagal mengubah status arsip tujuan");
    } finally {
      setIsActionLoading(false);
    }
  };

  if (loading && !goal) {
    return <GoalEmptyState />;
  }

  // Calculate derived values
  const eta = goal ? calculateETAInfo(goal) as ETAInfo : null;
  const isAchieved = goal?.status === "achieved";
  const isWithdrawn = goal?.status === "withdrawn";
  const hasFunds = goal?.current_amount ? goal.current_amount > 0 : false;

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header Section */}
      <GoalDetailHeader
        goal={goal || null}
        isLoading={loading}
        onEdit={openEditModal}
        onDelete={() => setShowDeleteGoalModal(true)}
        onMarkComplete={handleMarkComplete}
        onToggleArchive={handleToggleArchive}
      />

  

      {/* Progress Section */}
      <GoalProgressSection goal={goal || null} isLoading={loading} />

      {/* Deadline & Transaction Grid */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        <div className="flex-1">
          <GoalDeadlineEstimation goal={goal || null} eta={eta} isLoading={loading} />
        </div>

        {/* Transaction List */}
        <div className="flex-1">
          <GoalTransactionList
            transactions={transactions}
            hasFunds={hasFunds}
            isAchieved={isAchieved || false}
            isWithdrawn={isWithdrawn || false}
            onTopup={() => setIsTopupModalOpen(true)}
            onWithdraw={() => setIsWithdrawModalOpen(true)}
            onDeleteTransaction={(tx) => setTransactionToDelete(tx)}
          />
        </div>
      </div>

      {/* Modals */}
      <GoalDetailModals state={state} handlers={handlers} />
    </div>
  );
}

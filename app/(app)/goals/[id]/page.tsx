"use client";

import { useGoalDetailState, useGoalDetailHandlers } from "./hooks";
import {
  GoalDetailHeader,
  GoalProgressSection,
  GoalDeadlineEstimation,
  GoalTransactionList,
  GoalDetailLoading,
  GoalDetailModals
} from "./components";
import { GoalDetailPageSkeleton } from "./page.skeleton";
import { calculateETAInfo } from "../utils";
import { ETAInfo } from "../types";

export default function GoalDetailPage() {
  const state = useGoalDetailState();
  const handlers = useGoalDetailHandlers(state);

  const {
    goal,
    transactions,
    loading,
    setIsTopupModalOpen,
    setIsWithdrawModalOpen,
    setShowDeleteGoalModal,
    setTransactionToDelete,
    openEditModal
  } = state;

  const { handleMarkComplete, handleToggleArchive } = handlers;

  if (loading && !goal) {
    return <GoalDetailPageSkeleton />;
  }

  // Calculate derived values
  const eta = goal ? (calculateETAInfo(goal) as ETAInfo) : null;
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

"use client";

import { Plus, PiggyBank } from "lucide-react";
import { Button } from "@/components/ui/atoms/Button";
import { PageHeader } from "@/components/ui/molecules/PageHeader";
import { useGoalsData } from "./hooks/useGoalsData";
import { useGoalsState } from "./hooks/useGoalsState";
import { useGoalsHandlers } from "./hooks/useGoalsHandlers";

import { GoalsSummary } from "./components/GoalsSummary";
import { GoalCard } from "./components/GoalCard";
import { GoalsFilters } from "./components/GoalsFilters";
import { GoalsEmptyState } from "./components/GoalsEmptyState";
import { GoalsModals } from "./components/GoalsModals";
import { GoalsSkeleton } from "./components/GoalsSkeleton";

export default function GoalsPage() {
  const {
    goals,
    loading,
    activeWallets,
    user,
    createGoal,
    updateGoal,
    deleteGoal,
    createTopup,
    createWithdrawal,
    deleteTransaction,
    fetchHistory
  } = useGoalsData();

  const state = useGoalsState(activeWallets);

  const {
    handleSaveGoal,
    handleDeleteGoal,
    handleSaveTransaction,
    handleOpenHistoryModal,
    handleDeleteTransaction
  } = useGoalsHandlers({
    user,
    createGoal,
    updateGoal,
    deleteGoal,
    createTopup,
    createWithdrawal,
    deleteTransaction,
    fetchHistory,
    closeAllModals: state.closeAllModals,
    resetGoalForm: state.resetGoalForm,
    setSelectedGoal: state.setSelectedGoal,
    setTxAmount: state.setTxAmount,
    setSubmittingGoal: state.setSubmittingGoal,
    setSubmittingTx: state.setSubmittingTx,
    setIsDeleteSubmitting: state.setIsDeleteSubmitting,
    setTransactionsHistory: state.setTransactionsHistory,
    setLoadingHistory: state.setLoadingHistory,
    setIsTxDeleteSubmitting: state.setIsTxDeleteSubmitting
  });

  // Filtered goals
  const filteredGoals = goals.filter((item) => {
    const matchesFilter = state.statusFilter === "all" || item.status === state.statusFilter;
    const matchesSearch = item.name.toLowerCase().includes(state.searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleSubmitGoal = (e: React.FormEvent) => {
    handleSaveGoal(
      e,
      state.formName,
      state.formTargetAmount,
      state.formTargetDate,
      state.formIcon,
      state.editingGoal,
      state.isAddModalOpen
    );
  };

  const handleSubmitTx = (e: React.FormEvent, type: "topup" | "withdrawal") => {
    handleSaveTransaction(
      e,
      type,
      state.selectedGoal,
      state.txAmount,
      state.txWalletId,
      state.txDate,
      state.isTopupModalOpen,
      state.isWithdrawModalOpen
    );
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <PageHeader
        icon={PiggyBank}
        title="Rencana Tabungan (Goals)"
        description="Rencanakan, tabung, dan capai impian finansial Anda secara terstruktur."
        actions={
          <Button size="sm" onClick={state.openAddModal}>
            <Plus className="w-4 h-4 mr-1.5" />
            Tambah Target
          </Button>
        }
      />

      {/* Filters and Search */}
      <GoalsFilters
        statusFilter={state.statusFilter}
        searchTerm={state.searchTerm}
        onStatusFilterChange={state.setStatusFilter}
        onSearchChange={state.setSearchTerm}
      />

      {/* Summary Cards */}
      <GoalsSummary goals={goals} />

      {/* Goals Grid */}
      {loading ? (
        <GoalsSkeleton />
      ) : filteredGoals.length === 0 ? (
        <GoalsEmptyState
          searchTerm={state.searchTerm}
          statusFilter={state.statusFilter}
          onAddClick={state.openAddModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={state.openEditModal}
              onDelete={state.setGoalToDelete}
              onTopup={(g) => state.openTxModal(g, "topup")}
              onWithdraw={(g) => state.openTxModal(g, "withdrawal")}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <GoalsModals
        isAddModalOpen={state.isAddModalOpen}
        isEditModalOpen={state.isEditModalOpen}
        formName={state.formName}
        setFormName={state.setFormName}
        formTargetAmount={state.formTargetAmount}
        setFormTargetAmount={state.setFormTargetAmount}
        formTargetDate={state.formTargetDate}
        setFormTargetDate={state.setFormTargetDate}
        formIcon={state.formIcon}
        setFormIcon={state.setFormIcon}
        submittingGoal={state.submittingGoal}
        onSubmitGoal={handleSubmitGoal}
        closeAllModals={state.closeAllModals}

        isTopupModalOpen={state.isTopupModalOpen}
        setIsTopupModalOpen={state.setIsTopupModalOpen}
        selectedGoal={state.selectedGoal}
        txAmount={state.txAmount}
        setTxAmount={state.setTxAmount}
        txWalletId={state.txWalletId}
        setTxWalletId={state.setTxWalletId}
        txDate={state.txDate}
        setTxDate={state.setTxDate}
        submittingTx={state.submittingTx}
        onSubmitTopup={(e) => handleSubmitTx(e, "topup")}
        wallets={activeWallets}

        isWithdrawModalOpen={state.isWithdrawModalOpen}
        setIsWithdrawModalOpen={state.setIsWithdrawModalOpen}
        onSubmitWithdraw={(e) => handleSubmitTx(e, "withdrawal")}

        isHistoryModalOpen={state.isHistoryModalOpen}
        setIsHistoryModalOpen={state.setIsHistoryModalOpen}
        historyGoal={state.historyGoal}
        transactionsHistory={state.transactionsHistory}
        loadingHistory={state.loadingHistory}
        setTxToDelete={state.setTxToDelete}

        goalToDelete={state.goalToDelete}
        setGoalToDelete={state.setGoalToDelete}
        isDeleteSubmitting={state.isDeleteSubmitting}
        onDeleteGoal={() => handleDeleteGoal(state.goalToDelete)}

        txToDelete={state.txToDelete}
        setTxToDeleteAction={state.setTxToDelete}
        isTxDeleteSubmitting={state.isTxDeleteSubmitting}
        onDeleteTx={() => handleDeleteTransaction(state.txToDelete, state.historyGoal)}
      />
    </div>
  );
}

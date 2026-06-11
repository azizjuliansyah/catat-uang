"use client";

import { Plus, PiggyBank } from "lucide-react";
import { Button } from "@/components/ui/atoms/Button";
import { SkeletonCard } from "@/components/ui/organisms/SkeletonLoading";

import { useGoalsData } from "./hooks/useGoalsData";
import { useGoalsState } from "./hooks/useGoalsState";
import { useGoalsHandlers } from "./hooks/useGoalsHandlers";

import { GoalsSummary } from "./components/GoalsSummary";
import { GoalCard } from "./components/GoalCard";
import { GoalsFilters } from "./components/GoalsFilters";
import { GoalsModals } from "./components/GoalsModals";

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight font-display">Rencana Tabungan (Goals)</h1>
          <p className="text-xs text-text-secondary mt-1">Rencanakan, tabung, dan capai impian finansial Anda secara terstruktur.</p>
        </div>
        <Button size="sm" onClick={state.openAddModal} className="self-stretch sm:self-auto">
          <Plus className="w-4 h-4 mr-1.5" />
          Tambah Target
        </Button>
      </div>

      {/* Summary Cards */}
      <GoalsSummary goals={goals} />

      {/* Filters and Search */}
      <GoalsFilters
        statusFilter={state.statusFilter}
        searchTerm={state.searchTerm}
        onStatusFilterChange={state.setStatusFilter}
        onSearchChange={state.setSearchTerm}
      />

      {/* Goals Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <SkeletonCard key={n} />
          ))}
        </div>
      ) : filteredGoals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 border border-dashed border-border rounded-2xl text-center">
          <div className="w-12 h-12 rounded-full bg-surface-hover flex items-center justify-center text-text-secondary/40 mb-3">
            <PiggyBank className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-text-primary">Tidak ada target tabungan</h3>
          <p className="text-xs text-text-secondary mt-1 max-w-sm">
            {state.searchTerm
              ? "Coba ganti kata kunci pencarian Anda."
              : "Mulai buat target impian baru dan kelola tabungan Anda."}
          </p>
          {!state.searchTerm && state.statusFilter === "all" && (
            <Button
              onClick={state.openAddModal}
              variant="ghost"
              className="mt-4 inline-flex items-center gap-1 text-xs text-primary font-bold hover:underline cursor-pointer p-0 h-auto min-h-0 bg-transparent border-transparent"
            >
              Tambah target pertama Anda →
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={state.openEditModal}
              onDelete={state.setGoalToDelete}
              onHistory={(g) => handleOpenHistoryModal(g, state.setHistoryGoal, state.setIsHistoryModalOpen)}
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

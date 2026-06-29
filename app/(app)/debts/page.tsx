"use client";

import { useEffect } from "react";
import { useApp } from "@/app/providers/AppProvider";
import { Plus, HandCoins } from "lucide-react";
import { Button } from "@/components/ui/atoms/Button";
import { PageHeader } from "@/components/ui/molecules/PageHeader";
import { useDebtsState } from "./hooks/useDebtsState";
import { useDebtsHandlers } from "./hooks/useDebtsHandlers";

import { DebtsSummary } from "./components/DebtsSummary";
import { DebtCard } from "./components/DebtCard";
import { DebtsFilters } from "./components/DebtsFilters";
import { DebtsEmptyState } from "./components/DebtsEmptyState";
import { DebtsGridSkeleton } from "./components/DebtsGridSkeleton";
import { DebtFormModal } from "./components/modals/DebtFormModal";
import { DeleteDebtModal } from "./components/modals/DeleteDebtModal";

export default function DebtsPage() {
  const { user, loadingUser, wallets, loadingWallets, refreshWallets } = useApp();
  const loading = loadingUser || loadingWallets;

  const state = useDebtsState(wallets);

  const {
    fetchDebts,
    handleSaveDebt,
    handleDeleteDebt
  } = useDebtsHandlers({
    user,
    refreshWallets,
    setIsAddModalOpen: state.setIsAddModalOpen,
    setIsEditModalOpen: state.setIsEditModalOpen,
    setIsPayModalOpen: state.setIsPayModalOpen,
    setDebtToDelete: state.setDebtToDelete,
    setPaymentToDelete: state.setPaymentToDelete,
    resetDebtForm: state.resetDebtForm,
    setPayingDebt: state.setPayingDebt,
    setPayAmount: state.setPayAmount,
    formName: state.formName,
    formType: state.formType,
    formPackages: state.formPackages,
    editingDebt: state.editingDebt,
    submittingDebt: state.submittingDebt,
    setSubmittingDebt: state.setSubmittingDebt,
    payingDebt: state.payingDebt,
    payAmount: state.payAmount,
    payWalletId: state.payWalletId,
    payDate: state.payDate,
    payProofFiles: state.payProofFiles,
    setPayProofFiles: state.setPayProofFiles,
    payProofPreviews: state.payProofPreviews,
    setPayProofPreviews: state.setPayProofPreviews,
    submittingPayment: state.submittingPayment,
    setSubmittingPayment: state.setSubmittingPayment,
    setIsDeleteSubmitting: state.setIsDeleteSubmitting,
    setIsPayDeleteSubmitting: state.setIsPayDeleteSubmitting,
    setDebts: state.setDebts
  });

  // Init Data
  useEffect(() => {
    if (!loadingUser && user) {
      fetchDebts();
    }
  }, [user, loadingUser]);

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <PageHeader
        icon={HandCoins}
        title="Kelola Hutang & Piutang"
        description="Catat dan lacak pembayaran hutang piutang Anda dengan mudah."
        actions={
          <Button size="sm" onClick={state.openAddModal}>
            <Plus className="w-4 h-4 mr-1.5" />
            Tambah Catatan
          </Button>
        }
      />

      {/* Filters and Search */}
      <DebtsFilters
        activeTab={state.activeTab}
        onTabChange={(tab) => {
          state.setActiveTab(tab);
          state.setSearchTerm("");
        }}
        subTab={state.subTab}
        onSubTabChange={state.setSubTab}
        searchTerm={state.searchTerm}
        onSearchChange={state.setSearchTerm}
      />

      {/* Summary Cards */}
      <DebtsSummary debts={state.debts} isLoading={loading} />

      {/* Main List */}
      {loading ? (
        <DebtsGridSkeleton />
      ) : state.filteredDebts.length === 0 ? (
        <DebtsEmptyState
          searchTerm={state.searchTerm}
          activeTab={state.activeTab}
          subTab={state.subTab}
          onAddClick={state.openAddModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {state.filteredDebts.map((item) => (
            <DebtCard
              key={item.id}
              item={item}
              onEdit={state.openEditModal}
              onDelete={state.setDebtToDelete}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <DebtFormModal
        isOpen={state.isAddModalOpen || state.isEditModalOpen}
        onClose={() => {
          state.setIsAddModalOpen(false);
          state.setIsEditModalOpen(false);
        }}
        onSubmit={handleSaveDebt}
        isEdit={state.isEditModalOpen}
        formType={state.formType}
        setFormType={state.setFormType}
        formName={state.formName}
        setFormName={state.setFormName}
        formPackages={state.formPackages}
        setFormPackages={state.setFormPackages}
        isSubmitting={state.submittingDebt}
        editingDebt={state.editingDebt}
      />

      <DeleteDebtModal
        isOpen={state.debtToDelete !== null}
        onClose={() => state.setDebtToDelete(null)}
        debtToDelete={state.debtToDelete}
        onConfirm={() => handleDeleteDebt(state.debtToDelete)}
        isSubmitting={state.isDeleteSubmitting}
      />
    </div>
  );
}

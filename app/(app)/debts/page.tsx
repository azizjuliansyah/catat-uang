"use client";

import { useEffect } from "react";
import { useApp } from "@/app/providers/AppProvider";
import { Plus, HandCoins } from "lucide-react";
import { Button } from "@/components/ui/atoms/Button";
import { PageHeader } from "@/components/ui/molecules/PageHeader";
import { useDebtsState, useDebtsHandlers } from "./hooks";
import {
  DebtHeader,
  DebtFilterBar,
  DebtsSummary,
  DebtCard,
  DebtGridSkeleton,
  DebtFormModal,
  DeleteDebtModal
} from "./components";
import { EmptyState } from "@/components/ui/organisms/EmptyState";
import { Receipt } from "lucide-react";
import { DebtsPageSkeleton, DebtsGridSkeleton as NewDebtsGridSkeleton } from "./page.skeleton";

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
      <DebtHeader onAddClick={state.openAddModal} />

      {/* Filters and Search */}
      <DebtFilterBar
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
        <NewDebtsGridSkeleton />
      ) : state.filteredDebts.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Tidak ada catatan ditemukan"
          description={
            state.searchTerm
              ? "Coba ganti kata kunci pencarian Anda."
              : `Belum ada catatan ${state.activeTab === "owe" ? "hutang" : "piutang"} ${state.subTab === "active" ? "aktif" : "lunas"} Anda.`
          }
          actionLabel={!state.searchTerm && state.subTab === "active" ? "Tambah Catatan Baru" : undefined}
          onAction={!state.searchTerm && state.subTab === "active" ? state.openAddModal : undefined}
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

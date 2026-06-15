"use client";

import { useEffect } from "react";
import { useApp } from "@/app/providers/AppProvider";
import { Plus, Search, Receipt } from "lucide-react";
import { Button } from "@/components/ui/atoms/Button";
import { TabButton } from "@/components/ui/molecules/TabButton";
import { useDebtsState } from "./hooks/useDebtsState";
import { useDebtsHandlers } from "./hooks/useDebtsHandlers";

import { DebtsSummary } from "./components/DebtsSummary";
import { DebtCard } from "./components/DebtCard";
import { DebtsFilters } from "./components/DebtsFilters";
import { DebtFormModal } from "./components/modals/DebtFormModal";
import { PaymentModal } from "./components/modals/PaymentModal";
import { DeleteDebtModal } from "./components/modals/DeleteDebtModal";
import { DebtsSkeleton } from "./components/DebtsSkeleton";

export default function DebtsPage() {
  const { user, loadingUser, wallets, loadingWallets, refreshWallets } = useApp();
  const loading = loadingUser || loadingWallets;

  const state = useDebtsState(wallets);

  const {
    fetchDebts,
    handleSaveDebt,
    handleDeleteDebt,
    handleRecordPayment
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight font-display">Kelola Hutang & Piutang</h1>
          <p className="text-xs text-text-secondary mt-1">Catat dan lacak pembayaran hutang piutang Anda dengan mudah.</p>
        </div>
        <Button size="sm" onClick={state.openAddModal} className="self-stretch sm:self-auto">
          <Plus className="w-4 h-4 mr-1.5" />
          Tambah Catatan
        </Button>
      </div>

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
      <DebtsSummary debts={state.debts} />

      {/* Main List */}
      {loading ? (
        <DebtsSkeleton />
      ) : state.filteredDebts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 border border-dashed border-border rounded-2xl text-center">
          <div className="w-12 h-12 rounded-full bg-surface-hover flex items-center justify-center text-text-secondary/40 mb-3">
            <Receipt className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-text-primary">Tidak ada catatan ditemukan</h3>
          <p className="text-xs text-text-secondary mt-1 max-w-sm">
            {state.searchTerm
              ? "Coba ganti kata kunci pencarian Anda."
              : `Belum ada catatan ${state.activeTab === "owe" ? "hutang" : "piutang"} ${state.subTab === "active" ? "aktif" : "lunas"} Anda.`}
          </p>
          {!state.searchTerm && state.subTab === "active" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={state.openAddModal}
              className="mt-4 text-xs text-primary font-bold hover:underline cursor-pointer min-h-0 py-1 px-2"
            >
              Tambah catatan baru →
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.filteredDebts.map((item) => (
            <DebtCard
              key={item.id}
              item={item}
              onEdit={state.openEditModal}
              onDelete={state.setDebtToDelete}
              onPay={state.openPayModal}
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

      <PaymentModal
        isOpen={state.isPayModalOpen}
        onClose={() => state.setIsPayModalOpen(false)}
        onSubmit={handleRecordPayment}
        payingDebt={state.payingDebt}
        payAmount={state.payAmount}
        setPayAmount={state.setPayAmount}
        payWalletId={state.payWalletId}
        setPayWalletId={state.setPayWalletId}
        payDate={state.payDate}
        setPayDate={state.setPayDate}
        payProofFiles={state.payProofFiles}
        setPayProofFiles={state.setPayProofFiles}
        payProofPreviews={state.payProofPreviews}
        setPayProofPreviews={state.setPayProofPreviews}
        isSubmitting={state.submittingPayment}
        wallets={wallets}
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

"use client";

import { useApp } from "@/app/providers/AppProvider";
import { EmptyState } from "@/components/ui/organisms/EmptyState";
import { ArrowRightLeft } from "lucide-react";
import {
  TransactionsHeader,
  TransactionsFilterBar,
  TransactionsSummary,
  TransactionListGroup,
  TransactionsListSkeleton,
  RunTemplatesModal,
  TransactionsModals
} from "./components";

import { useTransactionsState, useTransactionsHandlers } from "./hooks";
import { formatIDR, formatDateLong } from "./utils";

export default function TransactionsPage() {
  const { wallets, categories, setIsCreateTransactionModalOpen } = useApp();

  // Temporary container for initial filter hook triggers
  const stateHelper = useTransactionsState([]);

  // Fetching & operations handlers hook
  const handlers = useTransactionsHandlers(
    stateHelper.dateRangeType,
    stateHelper.customStartDate,
    stateHelper.customEndDate
  );

  const {
    loading,
    transactions,
    deletingId,
    fetchTransactions,
    handleDeleteTransaction,
    handleDetail,
    handleEdit,
    handleCloseDetail,
    handleCloseEdit
  } = handlers;

  // Core filter & UI state hook linked with transactions data
  const state = useTransactionsState(transactions);

  const {
    searchTerm,
    setSearchTerm,
    selectedType,
    setSelectedType,
    selectedWalletId,
    setSelectedWalletId,
    selectedCategoryId,
    setSelectedCategoryId,
    dateRangeType,
    setDateRangeType,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    showFilters,
    setShowFilters,
    transactionToDelete,
    setTransactionToDelete,
    receiptModalUrl,
    setReceiptModalUrl,
    isRunTemplatesOpen,
    setIsRunTemplatesOpen,
    totalIncome,
    totalExpense,
    netFlow,
    groupedTransactions,
    dateTotals,
    itemsPerPage,
    setItemsPerPage,
    getDatePage,
    setDatePage,
    getDatePaginatedTransactions,
    getDateTotalPages,
    uniqueDates,
    isEditModalOpen,
    isDetailModalOpen,
    transactionToEdit,
    transactionToView
  } = state;

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <TransactionsHeader
        onRunTemplatesClick={() => setIsRunTemplatesOpen(true)}
        onCreateTransactionClick={() => setIsCreateTransactionModalOpen(true)}
      />

      {/* Filter and Search Bar */}
      <TransactionsFilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        dateRangeType={dateRangeType}
        setDateRangeType={setDateRangeType}
        customStartDate={customStartDate}
        setCustomStartDate={setCustomStartDate}
        customEndDate={customEndDate}
        setCustomEndDate={setCustomEndDate}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        selectedWalletId={selectedWalletId}
        setSelectedWalletId={setSelectedWalletId}
        selectedCategoryId={selectedCategoryId}
        setSelectedCategoryId={setSelectedCategoryId}
        wallets={wallets}
        categories={categories}
      />

      {/* Summary Stats */}
      <TransactionsSummary
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        netFlow={netFlow}
        formatIDR={formatIDR}
        isLoading={loading}
      />

      {/* Transactions List */}
      {loading ? (
        <TransactionsListSkeleton />
      ) : uniqueDates.length > 0 ? (
        <TransactionListGroup
          uniqueDates={uniqueDates}
          groupedTransactions={groupedTransactions}
          dateTotals={dateTotals}
          formatDateLong={formatDateLong}
          formatIDR={formatIDR}
          setReceiptModalUrl={setReceiptModalUrl}
          setTransactionToDelete={setTransactionToDelete}
          onDetail={(tx) => handleDetail(tx, state)}
          onEdit={(tx) => handleEdit(tx, state)}
          getDatePage={getDatePage}
          setDatePage={setDatePage}
          getDatePaginatedTransactions={getDatePaginatedTransactions}
          getDateTotalPages={getDateTotalPages}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
        />
      ) : (
        <EmptyState
          icon={ArrowRightLeft}
          title="Tidak ada transaksi"
          description="Tidak ditemukan transaksi untuk filter saat ini. Coba pilih rentang tanggal lain atau ubah filter pencarian Anda."
        />
      )}

      {/* Modals Container */}
      <TransactionsModals
        transactionToDelete={transactionToDelete}
        onCloseDelete={() => setTransactionToDelete(null)}
        onConfirmDelete={() => {
          if (transactionToDelete) {
            handleDeleteTransaction(transactionToDelete, () => setTransactionToDelete(null));
          }
        }}
        isDeleting={deletingId !== null}
        receiptModalUrl={receiptModalUrl}
        onCloseReceipt={() => setReceiptModalUrl(null)}
        formatIDR={formatIDR}
        isEditOpen={isEditModalOpen}
        onCloseEdit={() => handleCloseEdit(state)}
        onEditSuccess={() => {
          fetchTransactions();
          handleCloseEdit(state);
        }}
        transactionToEdit={transactionToEdit}
        isDetailOpen={isDetailModalOpen}
        onCloseDetail={() => handleCloseDetail(state)}
        transactionToView={transactionToView}
      />

      {/* Run Templates Modal */}
      <RunTemplatesModal
        isOpen={isRunTemplatesOpen}
        onClose={() => setIsRunTemplatesOpen(false)}
        onSuccess={fetchTransactions}
      />
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/app/providers/AppProvider";
import { EmptyState } from "@/components/ui/organisms/EmptyState";
import { Button } from "@/components/ui/atoms/Button";
import { PageHeader } from "@/components/ui/molecules/PageHeader";
import { ArrowRightLeft, Plus, Sparkles } from "lucide-react";
import { TransactionsFilters } from "./components/TransactionsFilters";
import { TransactionsStats } from "./components/TransactionsStats";
import { TransactionListGroup } from "./components/TransactionListGroup";
import { TransactionsSkeleton } from "./components/TransactionsSkeleton";
import { RunTemplatesModal } from "./components/RunTemplatesModal";

import { useTransactionsState } from "./hooks/useTransactionsState";
import { useTransactionsHandlers } from "./hooks/useTransactionsHandlers";
import { TransactionsModals } from "./components/TransactionsModals";
import { formatIDR, formatDateLong } from "./utils";
import { Transaction } from "./types";

export default function TransactionsPage() {
  const router = useRouter();
  const { wallets, categories } = useApp();

  // Temporary container for initial filter hook triggers
  const stateHelper = useTransactionsState([]);

  // Fetching & operations handlers hook
  const {
    loading,
    transactions,
    deletingId,
    fetchTransactions,
    handleDeleteTransaction,
  } = useTransactionsHandlers(
    stateHelper.dateRangeType,
    stateHelper.customStartDate,
    stateHelper.customEndDate
  );

  // Core filter & UI state hook linked with transactions data
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
    uniqueDates,
  } = useTransactionsState(transactions);

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const [transactionToView, setTransactionToView] = useState<Transaction | null>(null);

  // Modal handlers
  const handleDetail = (tx: Transaction) => {
    setTransactionToView(tx);
    setIsDetailModalOpen(true);
  };

  const handleEdit = (tx: Transaction) => {
    setTransactionToEdit(tx);
    setIsEditModalOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailModalOpen(false);
    setTransactionToView(null);
  };

  const handleCloseEdit = () => {
    setIsEditModalOpen(false);
    setTransactionToEdit(null);
  };

  const handleCloseCreate = () => {
    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <PageHeader
        icon={ArrowRightLeft}
        title="Daftar Transaksi"
        description="Lihat, cari, filter, dan kelola semua catatan keuangan Anda."
        actions={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsRunTemplatesOpen(true)}
            >
              <Sparkles className="w-4 h-4 mr-1.5 text-primary" />
              Jalankan Template
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Transaksi Baru
            </Button>
          </>
        }
      />

      {/* Filter and Search Bar */}
      <TransactionsFilters
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
      <TransactionsStats
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        netFlow={netFlow}
        formatIDR={formatIDR}
      />

      {/* Transactions List */}
      {loading ? (
        <TransactionsSkeleton />
      ) : uniqueDates.length > 0 ? (
        <TransactionListGroup
          uniqueDates={uniqueDates}
          groupedTransactions={groupedTransactions}
          formatDateLong={formatDateLong}
          formatIDR={formatIDR}
          setReceiptModalUrl={setReceiptModalUrl}
          setTransactionToDelete={setTransactionToDelete}
          onDetail={handleDetail}
          onEdit={handleEdit}
        />
      ) : (
        <EmptyState
          icon={ArrowRightLeft}
          title="Tidak ada transaksi"
          description="Tidak ditemukan transaksi untuk filter saat ini. Coba pilih rentang tanggal lain atau ubah filter pencarian Anda."
          className="w-full max-w-none"
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
        isCreateOpen={isCreateModalOpen}
        onCloseCreate={handleCloseCreate}
        onCreateSuccess={fetchTransactions}
        isEditOpen={isEditModalOpen}
        onCloseEdit={handleCloseEdit}
        onEditSuccess={fetchTransactions}
        transactionToEdit={transactionToEdit}
        isDetailOpen={isDetailModalOpen}
        onCloseDetail={handleCloseDetail}
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

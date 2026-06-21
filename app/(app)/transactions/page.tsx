"use client";

import { useRouter } from "next/navigation";
import { useApp } from "@/app/providers/AppProvider";
import { EmptyState } from "@/components/ui/organisms/EmptyState";
import { Button } from "@/components/ui/atoms/Button";
import { ArrowRightLeft, Plus, Sparkles } from "lucide-react";
import { TransactionsFilters } from "./components/TransactionsFilters";
import { TransactionsStats } from "./components/TransactionsStats";
import { TransactionListGroup } from "./components/TransactionListGroup";
import { TransactionsSkeleton } from "./components/TransactionsSkeleton";
import { RunTemplatesModal } from "./components/RunTemplatesModal";

import { useTransactionsState } from "./hooks/useTransactionsState";
import { useTransactionsHandlers } from "./hooks/useTransactionsHandlers";
import { TransactionsModals } from "./components/TransactionsModals";

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

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatDateLong = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2 font-display">
            <ArrowRightLeft className="w-6 h-6 text-primary" />
            Daftar Transaksi
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Lihat, cari, filter, dan kelola semua catatan keuangan Anda.
          </p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsRunTemplatesOpen(true)}
            className="flex-1 sm:flex-initial"
          >
            <Sparkles className="w-4 h-4 mr-1.5 text-primary" />
            Jalankan Template
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => router.push("/transactions/new")}
            className="flex-1 sm:flex-initial"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Transaksi Baru
          </Button>
        </div>
      </div>

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

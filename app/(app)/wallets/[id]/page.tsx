"use client";

import Link from "next/link";
import { ArrowLeft, Wallet as WalletIcon } from "lucide-react";
import { TransactionDetailModal } from "@/components/ui/organisms/TransactionDetailModal";

import { useWalletDetailState } from "./hooks/useWalletDetailState";
import { useWalletDetailHandlers } from "./hooks/useWalletDetailHandlers";
import { WalletDetailHeader } from "./components/WalletDetailHeader";
import { WalletDetailStats } from "./components/WalletDetailStats";
import { WalletDetailTransactionList } from "./components/WalletDetailTransactionList";

export default function WalletDetailPage() {
  const state = useWalletDetailState();
  const handlers = useWalletDetailHandlers(state);

  const {
    wallet,
    selectedTransaction,
    isDetailModalOpen,
    totalIncome,
    totalExpense,
    netFlow,
    groupedTransactions,
    uniqueDates,
    isPageLoading
  } = state;

  const {
    handleTransactionClick,
    handleModalClose,
    handleEditTransaction,
    formatDateGroup
  } = handlers;

  if (isPageLoading) {
    return (
      <div className="space-y-6 font-sans pb-12">
        <div className="h-5 w-32 bg-surface-hover animate-pulse rounded-lg" />
        <div className="bg-surface-card border border-border rounded-3xl p-6 h-32 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 bg-surface-card border border-border rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-surface-card border border-border rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <WalletIcon className="w-10 h-10 text-text-muted" />
        <p className="text-sm font-semibold text-text-secondary">Dompet tidak ditemukan.</p>
        <Link href="/wallets" className="text-primary text-sm hover:underline">
          Kembali ke Dompet
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Back navigation */}
      <Link
        href="/wallets"
        className="inline-flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Dompet
      </Link>

      {/* Wallet Header */}
      <WalletDetailHeader wallet={wallet} />

      {/* Stats */}
      <WalletDetailStats
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        netFlow={netFlow}
      />

      {/* Transaction History */}
      <WalletDetailTransactionList
        uniqueDates={uniqueDates}
        groupedTransactions={groupedTransactions}
        formatDateGroup={formatDateGroup}
        onTransactionClick={handleTransactionClick}
      />

      {/* Details Dialog Modal */}
      <TransactionDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleModalClose}
        transaction={selectedTransaction}
        onEdit={handleEditTransaction}
      />
    </div>
  );
}

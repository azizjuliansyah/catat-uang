"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Wallet as WalletIcon, ArrowRightLeft, Edit2, Trash2, ArrowRight, Archive, RotateCcw, Star, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { TransactionDetailModal } from "@/components/ui/organisms/TransactionDetailModal";
import { EmptyState } from "@/components/ui/organisms/EmptyState";
import { Button } from "@/components/ui/atoms/Button";
import { PageHeader } from "@/components/ui/molecules/PageHeader";
import { DatePeriodFilter } from "@/components/ui/atoms/DatePeriodFilter";
import { useApp } from "@/app/providers/AppProvider";
import { deleteWallet, toggleArchiveWallet, setDefaultWallet } from "../services";
import { useToast } from "@/components/ui/molecules/Toast";

import { useWalletDetailState } from "./hooks/useWalletDetailState";
import { useWalletDetailHandlers } from "./hooks/useWalletDetailHandlers";
import { useWalletDetailForms } from "./hooks/useWalletDetailForms";
import { WalletDetailStats } from "./components/WalletDetailStats";
import { TransactionListGroup } from "@/app/(app)/transactions/components/TransactionListGroup";
import { WalletDetailTransactionListSkeleton } from "./components/WalletDetailTransactionListSkeleton";
import { EditWalletModal } from "../components/modals/EditWalletModal";
import { DeleteWalletModal } from "../components/modals/DeleteWalletModal";
import { TransferModal } from "../components/modals/TransferModal";
import { formatIDR } from "@/lib/utils/format";

const PERIOD_OPTIONS = [
  { value: "all", label: "Semua Data" },
  { value: "1week", label: "Satu Minggu yang Lalu" },
  { value: "2weeks", label: "Dua Minggu yang Lalu" },
  { value: "1month", label: "Sebulan yang Lalu" },
  { value: "3months", label: "3 Bulan yang Lalu" },
  { value: "custom", label: "Custom Tanggal" }
];

export default function WalletDetailPage() {
  const router = useRouter();
  const state = useWalletDetailState();
  const handlers = useWalletDetailHandlers(state);
  const supabase = createClient();
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  const { user, wallets, refreshWallets } = useApp();

  const {
    wallet,
    selectedTransaction,
    isDetailModalOpen,
    totalIncome,
    totalExpense,
    netFlow,
    groupedTransactions,
    uniqueDates,
    isPageLoading,
    dateRangeType,
    setDateRangeType,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    itemsPerPage,
    setItemsPerPage,
    getDatePage,
    setDatePage,
    getDatePaginatedTransactions,
    getDateTotalPages,
  } = state;

  const {
    handleTransactionClick,
    handleModalClose,
    handleEditTransaction,
    formatDateGroup
  } = handlers;

  // Forms hook
  const forms = useWalletDetailForms({
    wallet,
    userId: user?.id,
    wallets,
    supabase,
    onTransferSuccess: refreshWallets,
  });

  // Action modals state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Actions
  const handleToggleArchive = async () => {
    if (!wallet) return;
    setIsActionLoading(true);
    try {
      const nextArchived = !wallet.is_archived;
      if (wallet.is_default && nextArchived) {
        showErrorToast("Dompet utama tidak bisa diarsipkan.");
        setIsActionLoading(false);
        return;
      }
      await toggleArchiveWallet(supabase, wallet.id, nextArchived);
      showSuccessToast(nextArchived ? "Dompet berhasil diarsipkan" : "Dompet berhasil diaktifkan kembali");
    } catch (err) {
      console.error(err);
      showErrorToast("Gagal mengubah status arsip dompet");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSetDefault = async () => {
    if (!wallet) return;
    setIsActionLoading(true);
    try {
      if (wallet.is_archived) {
        showErrorToast("Dompet terarsip tidak bisa dijadikan dompet utama.");
        setIsActionLoading(false);
        return;
      }
      await setDefaultWallet(supabase, wallet.id);
      showSuccessToast(`Dompet ${wallet.name} sekarang menjadi dompet utama!`);
    } catch (err) {
      console.error(err);
      showErrorToast("Gagal menjadikan dompet utama");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteWallet = async () => {
    if (!wallet) return;
    setIsDeleteSubmitting(true);
    try {
      await deleteWallet(supabase, wallet.id);
      setIsDeleteModalOpen(false);
      router.push("/wallets");
    } catch (err) {
      console.error(err);
      setIsDeleteSubmitting(false);
    }
  };

  if (!wallet && !isPageLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <WalletIcon className="w-10 h-10 text-text-muted" />
        <p className="text-sm font-semibold text-text-secondary">Dompet tidak ditemukan.</p>
      </div>
    );
  }

  // Create date totals map
  const dateTotalsMap = useMemo(() => {
    const totals: { [date: string]: { date: string; totalIncome: number; totalExpense: number; netFlow: number; transactionCount: number } } = {};
    uniqueDates.forEach((date) => {
      const dayTransactions = groupedTransactions[date] || [];
      const income = dayTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + Number(t.amount), 0);
      const expense = dayTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + Number(t.amount), 0);
      totals[date] = {
        date,
        totalIncome: income,
        totalExpense: expense,
        netFlow: income - expense,
        transactionCount: dayTransactions.length,
      };
    });
    return totals;
  }, [uniqueDates, groupedTransactions]);

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <PageHeader
        icon={ArrowRightLeft}
        title={wallet?.name || "Dompet"}
        description={
          <div className="flex items-center gap-3">
            {wallet?.is_default && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">Utama</span>
            )}
            {wallet?.is_archived && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary bg-surface-hover px-2 py-0.5 rounded-full">Diarsipkan</span>
            )}
          </div>
        }
        actions={
          !wallet?.is_archived && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                // Open new transaction modal with this wallet pre-selected
                window.dispatchEvent(new CustomEvent('open-create-transaction', { detail: { walletId: wallet?.id } }));
              }}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Transaksi Baru
            </Button>
          )
        }
      />

      {/* Date Filter */}
      <div className="bg-surface-card border border-border rounded-2xl p-4">
        <DatePeriodFilter
          value={dateRangeType}
          onChange={setDateRangeType}
          customStartDate={customStartDate}
          setCustomStartDate={setCustomStartDate}
          customEndDate={customEndDate}
          setCustomEndDate={setCustomEndDate}
          options={PERIOD_OPTIONS}
          size="sm"
          className="w-full sm:w-56"
        />
      </div>

      {/* Stats */}
      <WalletDetailStats
        wallet={wallet}
        currentBalance={wallet?.balance || 0}
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        netFlow={netFlow}
        isLoading={isPageLoading}
      />

      {/* Transactions List */}
      {isPageLoading ? (
        <WalletDetailTransactionListSkeleton />
      ) : uniqueDates.length > 0 ? (
        <TransactionListGroup
          uniqueDates={uniqueDates}
          groupedTransactions={groupedTransactions}
          dateTotals={dateTotalsMap}
          formatDateLong={formatDateGroup}
          formatIDR={formatIDR}
          setReceiptModalUrl={() => {}}
          setTransactionToDelete={() => {}}
          onDetail={handleTransactionClick}
          onEdit={handleEditTransaction}
          getDatePage={getDatePage}
          setDatePage={setDatePage}
          getDatePaginatedTransactions={getDatePaginatedTransactions}
          getDateTotalPages={getDateTotalPages}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
        />
      ) : (
        <EmptyState
          icon={WalletIcon}
          title="Belum ada transaksi"
          description="Mulai catat transaksi pertama di dompet ini."
          className="w-full max-w-none"
        />
      )}

      {/* Details Dialog Modal */}
      <TransactionDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleModalClose}
        transaction={selectedTransaction}
        onEdit={handleEditTransaction}
      />

      {/* Edit Wallet Modal */}
      <EditWalletModal
        isOpen={forms.isEditModalOpen}
        onClose={() => forms.setIsEditModalOpen(false)}
        onSubmit={forms.handleEditWallet}
        editingWallet={wallet}
        editName={forms.editName}
        setEditName={forms.setEditName}
        editIcon={forms.editIcon}
        setEditIcon={forms.setEditIcon}
        editColor={forms.editColor}
        setEditColor={forms.setEditColor}
        editIsDefault={forms.editIsDefault}
        setEditIsDefault={forms.setEditIsDefault}
        isSubmitting={forms.isEditing}
      />

      {/* Delete Wallet Modal */}
      <DeleteWalletModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        walletToDelete={wallet}
        onConfirm={handleDeleteWallet}
        isSubmitting={isDeleteSubmitting}
      />

      {/* Transfer Modal */}
      <TransferModal
        isOpen={forms.isTransferModalOpen}
        onClose={() => forms.setIsTransferModalOpen(false)}
        onSubmit={forms.handleTransferSubmit}
        wallets={wallets}
        tfSourceId={forms.tfSourceId}
        setTfSourceId={forms.setTfSourceId}
        tfDestId={forms.tfDestId}
        setTfDestId={forms.setTfDestId}
        tfAmount={forms.tfAmount}
        setTfAmount={forms.setTfAmount}
        tfDate={forms.tfDate}
        setTfDate={forms.setTfDate}
        tfDescription={forms.tfDescription}
        setTfDescription={forms.setTfDescription}
        isSubmitting={forms.isSubmittingTransfer}
      />
    </div>
  );
}

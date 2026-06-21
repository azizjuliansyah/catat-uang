import React from "react";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/atoms/Button";
import { CustomSelect } from "@/components/ui/atoms/CustomSelect";
import { formatIDR } from "@/lib/utils/format";
import { useGoalDetailState } from "../hooks/useGoalDetailState";
import { useGoalDetailHandlers } from "../hooks/useGoalDetailHandlers";

interface GoalDetailModalsProps {
  state: ReturnType<typeof useGoalDetailState>;
  handlers: ReturnType<typeof useGoalDetailHandlers>;
}

export function GoalDetailModals({ state, handlers }: GoalDetailModalsProps) {
  const {
    goal,
    wallets,
    isEditModalOpen,
    setIsEditModalOpen,
    isTopupModalOpen,
    setIsTopupModalOpen,
    isWithdrawModalOpen,
    setIsWithdrawModalOpen,
    showDeleteGoalModal,
    setShowDeleteGoalModal,
    transactionToDelete,
    setTransactionToDelete,
    formName,
    setFormName,
    formTargetAmount,
    setFormTargetAmount,
    formTargetDate,
    setFormTargetDate,
    isSavingGoal,
    txAmount,
    setTxAmount,
    txWalletId,
    setTxWalletId,
    txDate,
    setTxDate,
    isSavingTx,
    isDeletingGoal,
    isDeletingTx
  } = state;

  const {
    handleSaveGoal,
    handleTopup,
    handleWithdraw,
    handleDeleteGoal,
    handleDeleteTransaction
  } = handlers;

  return (
    <>
      {/* Edit Goal Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface-card border border-border rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-lg font-bold text-text-primary mb-4">Ubah Target Tabungan</h2>
            <form onSubmit={handleSaveGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">
                  Nama Target
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-input border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Contoh: Liburan ke Bali"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">
                  Target Dana
                </label>
                <input
                  type="number"
                  value={formTargetAmount}
                  onChange={(e) => setFormTargetAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-input border border-border rounded-lg text-sm text-text-primary font-mono focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">
                  Tanggal Target
                </label>
                <input
                  type="date"
                  value={formTargetDate}
                  onChange={(e) => setFormTargetDate(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-input border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  fullWidth
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isSavingGoal}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  fullWidth
                  disabled={isSavingGoal}
                >
                  {isSavingGoal ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Top-up Modal */}
      {isTopupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface-card border border-border rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-lg font-bold text-text-primary mb-4">Top-up Tabungan</h2>
            <form onSubmit={handleTopup} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">
                  Jumlah Top-up
                </label>
                <input
                  type="number"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-input border border-border rounded-lg text-sm text-text-primary font-mono focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="0"
                  min="0"
                  step="0.01"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">
                  Dari Dompet
                </label>
                <CustomSelect
                  value={txWalletId}
                  onChange={setTxWalletId}
                  options={wallets.filter(w => !w.is_archived).map((w) => ({
                    value: w.id,
                    label: `${w.name} (${formatIDR(w.balance)})`,
                    icon: <Wallet className="w-4 h-4 text-text-secondary" />
                  }))}
                  placeholder="Pilih dompet"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">
                  Tanggal
                </label>
                <input
                  type="date"
                  value={txDate}
                  onChange={(e) => setTxDate(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-input border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  fullWidth
                  onClick={() => setIsTopupModalOpen(false)}
                  disabled={isSavingTx}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  fullWidth
                  disabled={isSavingTx}
                >
                  {isSavingTx ? "Memproses..." : "Top-up"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface-card border border-border rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-lg font-bold text-text-primary mb-4">Tarik Dana Tabungan</h2>
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">
                  Jumlah Penarikan
                </label>
                <input
                  type="number"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-input border border-border rounded-lg text-sm text-text-primary font-mono focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="0"
                  min="0"
                  max={goal?.current_amount}
                  step="0.01"
                  autoFocus
                />
                <p className="text-[10px] text-text-secondary mt-1">
                  Tersedia: {formatIDR(goal?.current_amount || 0)}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">
                  Ke Dompet
                </label>
                <CustomSelect
                  value={txWalletId}
                  onChange={setTxWalletId}
                  options={wallets.filter(w => !w.is_archived).map((w) => ({
                    value: w.id,
                    label: `${w.name} (${formatIDR(w.balance)})`,
                    icon: <Wallet className="w-4 h-4 text-text-secondary" />
                  }))}
                  placeholder="Pilih dompet"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">
                  Tanggal
                </label>
                <input
                  type="date"
                  value={txDate}
                  onChange={(e) => setTxDate(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-input border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  fullWidth
                  onClick={() => setIsWithdrawModalOpen(false)}
                  disabled={isSavingTx}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  fullWidth
                  disabled={isSavingTx}
                >
                  {isSavingTx ? "Memproses..." : "Tarik"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Goal Modal */}
      {showDeleteGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface-card border border-border rounded-2xl w-full max-w-sm p-6 shadow-xl">
            <h2 className="text-lg font-bold text-text-primary mb-2">Hapus Target Tabungan?</h2>
            <p className="text-sm text-text-secondary mb-6">
              Tindakan ini akan menghapus "{goal?.name}" dan tidak dapat dibatalkan.
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setShowDeleteGoalModal(false)}
                disabled={isDeletingGoal}
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                fullWidth
                onClick={handleDeleteGoal}
                disabled={isDeletingGoal}
              >
                {isDeletingGoal ? "Menghapus..." : "Hapus"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Transaction Modal */}
      {transactionToDelete !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface-card border border-border rounded-2xl w-full max-w-sm p-6 shadow-xl">
            <h2 className="text-lg font-bold text-text-primary mb-2">Hapus Transaksi?</h2>
            <p className="text-sm text-text-secondary mb-6">
              Tindakan ini akan menghapus transaksi {transactionToDelete.type === "topup" ? "top-up" : "penarikan"} sebesar{" "}
              {formatIDR(transactionToDelete.amount)} dan tidak dapat dibatalkan.
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setTransactionToDelete(null)}
                disabled={isDeletingTx}
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                fullWidth
                onClick={handleDeleteTransaction}
                disabled={isDeletingTx}
              >
                {isDeletingTx ? "Menghapus..." : "Hapus"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

import { Wallet, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/atoms/Button";
import { Input } from "@/components/ui/atoms/Input";
import { CurrencyInput } from "@/components/ui/atoms/CurrencyInput";
import { CustomSelect } from "@/components/ui/atoms/CustomSelect";
import { FormField } from "@/components/ui/molecules/FormField";
import { Modal } from "@/components/ui/organisms/Modal";
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
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Ubah Target Tabungan"
        onSubmit={handleSaveGoal}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsEditModalOpen(false)}
              disabled={isSavingGoal}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSavingGoal}
            >
              {isSavingGoal ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <FormField
            label="Nama Target"
            required
          >
            <Input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Contoh: Liburan ke Bali"
              autoFocus
            />
          </FormField>

          <FormField
            label="Target Dana"
            required
            helperText={formTargetAmount ? `Terformat: ${formatIDR(parseFloat(formTargetAmount))}` : "Terformat: Rp 0"}
          >
            <CurrencyInput
              value={formTargetAmount}
              onChange={(e) => setFormTargetAmount(e.target.value)}
              placeholder="0"
            />
          </FormField>

          <FormField
            label="Tanggal Target"
            required
          >
            <Input
              type="date"
              value={formTargetDate}
              onChange={(e) => setFormTargetDate(e.target.value)}
            />
          </FormField>
        </div>
      </Modal>

      {/* Top-up Modal */}
      <Modal
        isOpen={isTopupModalOpen}
        onClose={() => setIsTopupModalOpen(false)}
        title="Top-up Tabungan"
        onSubmit={handleTopup}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => setIsTopupModalOpen(false)}
              disabled={isSavingTx}
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSavingTx}
            >
              {isSavingTx ? "Memproses..." : "Top-up"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <FormField
            label="Jumlah Top-up"
            required
            helperText={txAmount ? `Terformat: ${formatIDR(parseFloat(txAmount))}` : "Terformat: Rp 0"}
          >
            <CurrencyInput
              value={txAmount}
              onChange={(e) => setTxAmount(e.target.value)}
              placeholder="0"
              autoFocus
            />
          </FormField>

          <FormField
            label="Dari Dompet"
            required
          >
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
          </FormField>

          <FormField
            label="Tanggal"
            required
          >
            <Input
              type="date"
              value={txDate}
              onChange={(e) => setTxDate(e.target.value)}
            />
          </FormField>
        </div>
      </Modal>

      {/* Withdraw Modal */}
      <Modal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        title="Tarik Dana Tabungan"
        onSubmit={handleWithdraw}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsWithdrawModalOpen(false)}
              disabled={isSavingTx}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSavingTx}
            >
              {isSavingTx ? "Memproses..." : "Tarik"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <FormField
            label="Jumlah Penarikan"
            required
            helperText={txAmount ? `Terformat: ${formatIDR(parseFloat(txAmount))} • Tersedia: ${formatIDR(goal?.current_amount || 0)}` : `Terformat: Rp 0 • Tersedia: ${formatIDR(goal?.current_amount || 0)}`}
          >
            <CurrencyInput
              value={txAmount}
              onChange={(e) => setTxAmount(e.target.value)}
              placeholder="0"
              autoFocus
            />
          </FormField>

          <FormField
            label="Ke Dompet"
            required
          >
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
          </FormField>

          <FormField
            label="Tanggal"
            required
          >
            <Input
              type="date"
              value={txDate}
              onChange={(e) => setTxDate(e.target.value)}
            />
          </FormField>
        </div>
      </Modal>

      {/* Delete Goal Modal */}
      <Modal
        isOpen={showDeleteGoalModal}
        onClose={() => setShowDeleteGoalModal(false)}
        title="Hapus Target Tabungan?"
        isDestructive
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteGoalModal(false)}
              disabled={isDeletingGoal}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteGoal}
              disabled={isDeletingGoal}
            >
              {isDeletingGoal ? "Menghapus..." : "Hapus"}
            </Button>
          </div>
        }
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-md bg-danger/10 text-danger flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="flex-1 text-sm text-text-secondary leading-relaxed">
            Tindakan ini akan menghapus "{goal?.name}" dan tidak dapat dibatalkan.
          </div>
        </div>
      </Modal>

      {/* Delete Transaction Modal */}
      <Modal
        isOpen={transactionToDelete !== null}
        onClose={() => setTransactionToDelete(null)}
        title="Hapus Transaksi?"
        isDestructive
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setTransactionToDelete(null)}
              disabled={isDeletingTx}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteTransaction}
              disabled={isDeletingTx}
            >
              {isDeletingTx ? "Menghapus..." : "Hapus"}
            </Button>
          </div>
        }
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-md bg-danger/10 text-danger flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="flex-1 text-sm text-text-secondary leading-relaxed">
            Tindakan ini akan menghapus transaksi {transactionToDelete?.type === "topup" ? "top-up" : "penarikan"} sebesar{" "}
            {transactionToDelete && formatIDR(transactionToDelete.amount)} dan tidak dapat dibatalkan.
          </div>
        </div>
      </Modal>
    </>
  );
}

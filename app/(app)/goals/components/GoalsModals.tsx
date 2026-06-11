import { GoalFormModal } from "./modals/GoalFormModal";
import { TopupModal } from "./modals/TopupModal";
import { WithdrawModal } from "./modals/WithdrawModal";
import { HistoryModal } from "./modals/HistoryModal";
import { DeleteGoalModal } from "./modals/DeleteGoalModal";
import { DeleteTxModal } from "./modals/DeleteTxModal";

interface GoalsModalsProps {
  // Form state
  isAddModalOpen: boolean;
  isEditModalOpen: boolean;
  formName: string;
  setFormName: (v: string) => void;
  formTargetAmount: string;
  setFormTargetAmount: (v: string) => void;
  formTargetDate: string;
  setFormTargetDate: (v: string) => void;
  formIcon: string;
  setFormIcon: (v: string) => void;
  submittingGoal: boolean;
  onSubmitGoal: (e: React.FormEvent) => void;
  closeAllModals: () => void;

  // Top-up state
  isTopupModalOpen: boolean;
  setIsTopupModalOpen: (v: boolean) => void;
  selectedGoal: any;
  txAmount: string;
  setTxAmount: (v: string) => void;
  txWalletId: string;
  setTxWalletId: (v: string) => void;
  txDate: string;
  setTxDate: (v: string) => void;
  submittingTx: boolean;
  onSubmitTopup: (e: React.FormEvent) => void;
  wallets: Array<{ id: string; name: string; balance: number }>;

  // Withdraw state
  isWithdrawModalOpen: boolean;
  setIsWithdrawModalOpen: (v: boolean) => void;
  onSubmitWithdraw: (e: React.FormEvent) => void;

  // History state
  isHistoryModalOpen: boolean;
  setIsHistoryModalOpen: (v: boolean) => void;
  historyGoal: any;
  transactionsHistory: any[];
  loadingHistory: boolean;
  setTxToDelete: (tx: any) => void;

  // Delete states
  goalToDelete: any;
  setGoalToDelete: (g: any) => void;
  isDeleteSubmitting: boolean;
  onDeleteGoal: () => void;

  txToDelete: any;
  setTxToDeleteAction: (tx: any) => void;
  isTxDeleteSubmitting: boolean;
  onDeleteTx: () => void;
}

export function GoalsModals({
  isAddModalOpen,
  isEditModalOpen,
  formName,
  setFormName,
  formTargetAmount,
  setFormTargetAmount,
  formTargetDate,
  setFormTargetDate,
  formIcon,
  setFormIcon,
  submittingGoal,
  onSubmitGoal,
  closeAllModals,

  isTopupModalOpen,
  setIsTopupModalOpen,
  selectedGoal,
  txAmount,
  setTxAmount,
  txWalletId,
  setTxWalletId,
  txDate,
  setTxDate,
  submittingTx,
  onSubmitTopup,
  wallets,

  isWithdrawModalOpen,
  setIsWithdrawModalOpen,
  onSubmitWithdraw,

  isHistoryModalOpen,
  setIsHistoryModalOpen,
  historyGoal,
  transactionsHistory,
  loadingHistory,
  setTxToDelete,

  goalToDelete,
  setGoalToDelete,
  isDeleteSubmitting,
  onDeleteGoal,

  txToDelete,
  setTxToDeleteAction,
  isTxDeleteSubmitting,
  onDeleteTx
}: GoalsModalsProps) {
  return (
    <>
      <GoalFormModal
        isOpen={isAddModalOpen || isEditModalOpen}
        isEdit={isEditModalOpen}
        onClose={closeAllModals}
        onSubmit={onSubmitGoal}
        formName={formName}
        onFormNameChange={setFormName}
        formTargetAmount={formTargetAmount}
        onFormTargetAmountChange={setFormTargetAmount}
        formTargetDate={formTargetDate}
        onFormTargetDateChange={setFormTargetDate}
        formIcon={formIcon}
        onFormIconChange={setFormIcon}
        isSubmitting={submittingGoal}
      />

      <TopupModal
        isOpen={isTopupModalOpen}
        onClose={() => setIsTopupModalOpen(false)}
        onSubmit={onSubmitTopup}
        selectedGoal={selectedGoal}
        txAmount={txAmount}
        onTxAmountChange={setTxAmount}
        txWalletId={txWalletId}
        onTxWalletIdChange={setTxWalletId}
        txDate={txDate}
        onTxDateChange={setTxDate}
        isSubmitting={submittingTx}
        wallets={wallets}
      />

      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        onSubmit={onSubmitWithdraw}
        selectedGoal={selectedGoal}
        txAmount={txAmount}
        onTxAmountChange={setTxAmount}
        txWalletId={txWalletId}
        onTxWalletIdChange={setTxWalletId}
        txDate={txDate}
        onTxDateChange={setTxDate}
        isSubmitting={submittingTx}
        wallets={wallets}
      />

      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        historyGoal={historyGoal}
        transactionsHistory={transactionsHistory}
        loadingHistory={loadingHistory}
        onDeleteTx={setTxToDelete}
      />

      <DeleteGoalModal
        isOpen={goalToDelete !== null}
        onClose={() => setGoalToDelete(null)}
        goalToDelete={goalToDelete}
        onConfirm={onDeleteGoal}
        isSubmitting={isDeleteSubmitting}
      />

      <DeleteTxModal
        isOpen={txToDelete !== null}
        onClose={() => setTxToDeleteAction(null)}
        txToDelete={txToDelete}
        onConfirm={onDeleteTx}
        isSubmitting={isTxDeleteSubmitting}
      />
    </>
  );
}

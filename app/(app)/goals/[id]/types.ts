/**
 * Goal Detail Page Types
 * Extends shared goal types for the detail page
 */

export interface GoalDetailFormData {
  name: string;
  targetAmount: string;
  targetDate: string;
  icon: string;
}

export interface GoalTransactionFormData {
  amount: string;
  walletId: string;
  date: string;
}

export interface GoalDetailModals {
  isEditModalOpen: boolean;
  isTopupModalOpen: boolean;
  isWithdrawModalOpen: boolean;
  showDeleteGoalModal: boolean;
}

export type GoalModalType = keyof GoalDetailModals;

export type TransactionType = "expense" | "income";

export interface TransactionState {
  amount: string;
  type: TransactionType;
  sourceId: string;
  categoryId: string;
  description: string;
  transactionDate: string;
  existingReceiptUrl: string | null;
  receiptFile: File | null;
  receiptPreview: string | null;
  uploadingReceipt: boolean;
  shouldDeleteExistingReceipt: boolean;
  submitting: boolean;
  isDeleteModalOpen: boolean;
  deleting: boolean;
  loadingTx: boolean;
}

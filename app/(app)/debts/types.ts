export interface DebtTransactionProof {
  id: string;
  transaction_id: string;
  proof_url: string;
  created_at: string;
}

export interface DebtTransactionItem {
  id: string;
  debt_id: string;
  amount: number;
  due_date: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
  debt_transaction_proofs?: DebtTransactionProof[];
}

export interface DebtItem {
  id: string;
  user_id: string;
  name: string;
  total_amount: number;
  paid_amount: number;
  status: "unpaid" | "paid";
  type: "owe" | "lend";
  created_at: string;
  updated_at: string;
  debt_transactions?: DebtTransactionItem[];
}

export interface DebtPackage {
  id: string;
  totalAmount: string;
  dueDate: string;
  description: string;
  proofFiles?: File[] | null;
  proofPreviews?: string[] | null;
  existingProofUrls?: string[] | null;
  shouldDeleteProofUrls?: string[] | null;
}

export interface DebtPaymentProof {
  id: string;
  payment_id: string;
  proof_url: string;
  created_at: string;
}

export interface DebtPaymentItem {
  id: string;
  debt_id: string;
  wallet_id: string;
  amount: number;
  payment_date: string;
  created_at: string;
  wallets: {
    name: string;
  } | null;
  debt_payment_proofs?: DebtPaymentProof[];
}

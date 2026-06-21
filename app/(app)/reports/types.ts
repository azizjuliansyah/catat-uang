export interface Transaction {
  id: string;
  amount: number;
  type: "income" | "expense";
  transaction_date: string;
  description: string | null;
  category_id: string | null;
  categories: {
    name: string;
    icon: string;
    color: string;
  } | null;
  wallets: {
    name: string;
  } | null;
}

export interface DebtData {
  id: string;
  type: "owe" | "lend";
  total_amount: number;
  paid_amount: number;
  status: "unpaid" | "paid";
}

export type PeriodFilterType = "this_month" | "last_3_months" | "last_6_months" | "this_year" | "custom";

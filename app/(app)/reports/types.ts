import { CategoryItem } from "@/app/providers/AppProvider";

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

export interface CategoryTotalItem {
  id: string;
  name: string;
  type: "income" | "expense";
  icon: string;
  color: string;
  amount: number;
}

export interface SelectedDetailsResult {
  expenses: CategoryTotalItem[];
  income: CategoryTotalItem[];
  totalExpenseNominal: number;
  totalIncomeNominal: number;
}

export interface ReportsCategorySummaryProps {
  transactions: Transaction[];
  categories: CategoryItem[];
  startDate: Date;
  endDate: Date;
  isLoading?: boolean;
}


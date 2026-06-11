export interface SavingGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  status: "ongoing" | "achieved" | "withdrawn";
  icon: string;
  created_at: string;
  updated_at: string;
}

export interface GoalTransaction {
  id: string;
  goal_id: string;
  wallet_id: string;
  amount: number;
  date: string;
  type: "topup" | "withdrawal";
  wallet_name: string;
  created_at: string;
}

export interface ETAInfo {
  status: "achieved" | "late" | "ongoing";
  msg: string;
  daysLeft?: number;
  requiredWeekly?: number;
  requiredMonthly?: number;
  needed?: string;
}

export const GOAL_ICONS = [
  "PiggyBank", "Star", "Wallet", "Coins", "Banknote", "Building",
  "Briefcase", "Car", "Utensils", "ShoppingBag", "Film", "Smartphone"
];

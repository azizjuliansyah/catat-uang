export interface WalletItem {
  id: string;
  user_id: string;
  name: string;
  balance: number;
  initial_balance: number;
  icon: string;
  color: string;
  is_default: boolean;
  is_archived: boolean;
  created_at: string;
}

export const PRESETS = {
  colors: [
    { name: "Blue", hex: "#0C5CAB" },
    { name: "Green", hex: "#10B981" },
    { name: "Purple", hex: "#8B5CF6" },
    { name: "Red", hex: "#EF4444" },
    { name: "Orange", hex: "#F59E0B" },
    { name: "Cyan", hex: "#06B6D4" },
    { name: "Gray", hex: "#6B7280" }
  ],
  icons: ["Wallet", "CreditCard", "Banknote", "Coins", "PiggyBank", "Building", "Smartphone"]
};

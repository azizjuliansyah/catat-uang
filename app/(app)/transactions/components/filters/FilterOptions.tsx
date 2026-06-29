/**
 * Filter options and related types for TransactionsFilters
 */

export interface Wallet {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
}

export const PERIOD_OPTIONS = [
  { value: "1week", label: "Satu Minggu yang Lalu" },
  { value: "2weeks", label: "Dua Minggu yang Lalu" },
  { value: "1month", label: "Sebulan yang Lalu" },
  { value: "3months", label: "3 Bulan yang Lalu" },
  { value: "custom", label: "Custom Tanggal" }
];

export function getWalletOptions(wallets: Wallet[]) {
  return [
    { value: "all", label: "Semua Dompet" },
    ...wallets.map((w) => ({
      value: w.id,
      label: w.name,
    })),
  ];
}

export function getIncomeCategoryOptions(categories: Category[]) {
  return [
    { value: "all", label: "Semua Kategori Masuk" },
    ...categories
      .filter((c) => c.type === "income")
      .map((c) => ({
        value: c.id,
        label: c.name,
      })),
  ];
}

export function getExpenseCategoryOptions(categories: Category[]) {
  return [
    { value: "all", label: "Semua Kategori Keluar" },
    ...categories
      .filter((c) => c.type === "expense")
      .map((c) => ({
        value: c.id,
        label: c.name,
      })),
  ];
}

/**
 * Shared grid layout patterns used across the app.
 * These constants ensure consistent layouts between real content and skeleton UI.
 *
 * Grid classes extracted from actual page.tsx files:
 * - DashboardStats: grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4
 * - DebtsSummary: grid grid-cols-2 md:grid-cols-4 gap-4
 * - GoalsSummary: grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4
 * - TransactionsSummary: grid grid-cols-1 sm:grid-cols-3 gap-4
 * - Wallets grid: grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4
 * - Debts/Goals grid: grid grid-cols-1 md:grid-cols-2 gap-4 (goals uses gap-6)
 * - Categories grid: grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4
 * - Templates grid: grid grid-cols-1 sm:grid-cols-3 gap-4
 * - Dashboard main: grid grid-cols-1 lg:grid-cols-3 gap-6
 */

export const GRID_PATTERNS = {
  // Stats/info cards
  stats: {
    five: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4", // Dashboard stats
    four: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", // Goals, Reports, Paylater
    three: "grid grid-cols-1 sm:grid-cols-3 gap-4", // Transactions summary (non-responsive)
    threeResponsive: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", // Responsive 3-col
    two: "grid grid-cols-2 gap-4", // DebtsSummary base (expands to 4 on md)
  },
  // Item cards (wallets, debts, goals, paylater)
  cards: {
    dual: "grid grid-cols-1 md:grid-cols-2 gap-4", // Debts, Paylater\
    triple: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", // Wallets (3 col on lg)
    quad: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", // Wallets (4 col on lg)
  },
  // Settings (categories, templates)
  settings: {
    three: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4", // Categories
    threeWide: "grid grid-cols-1 sm:grid-cols-3 gap-4", // Templates (jumps to 3 on sm)
  },
  // Dashboard main layout
  dashboard: {
    main: "grid grid-cols-1 lg:grid-cols-3 gap-6", // Wallets (1 col) + Transactions (2 cols)
  }
} as const;

// Type exports for TypeScript
export type GridPattern = typeof GRID_PATTERNS;

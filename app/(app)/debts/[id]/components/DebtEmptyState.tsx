/**
 * Debt Empty State Component
 * Loading state for debt detail page
 */

export function DebtEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs text-text-secondary">Memuat detail transaksi...</p>
    </div>
  );
}

/**
 * Debt Detail Loading Component
 * Loading spinner indicator for debt detail page
 */

export function DebtDetailLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs text-text-secondary">Memuat detail transaksi...</p>
    </div>
  );
}

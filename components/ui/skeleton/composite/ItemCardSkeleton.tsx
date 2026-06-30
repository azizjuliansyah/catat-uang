/**
 * ItemCardSkeleton - Financial/item card skeleton for debts, goals, paylater, wallets.
 * Based on FinancialCard component structure.
 */

type ItemCardSkeletonVariant =
  | "card"           // Standard FinancialCard (debt, goal, paylater, wallet card)
  | "wallet-list"    // Dashboard wallet list item
  | "transaction-list"; // Transaction list item

interface ItemCardSkeletonProps {
  variant?: ItemCardSkeletonVariant;
  showIcon?: boolean;
  showBadge?: boolean;
  badgeText?: string; // Real badge text if shown
  showActions?: boolean;
  showTwoColumnAmounts?: boolean; // Debt/Goal style amounts (2 columns)
  showProgress?: boolean; // Goal/Debt progress bar
  showFooter?: boolean; // Date + detail link
  cardColor?: string; // For colored accent bar (FinancialCard style)
  className?: string;
}

export function ItemCardSkeleton({
  variant = "card",
  showIcon = true,
  showBadge = false,
  badgeText,
  showActions = true,
  showTwoColumnAmounts = false,
  showProgress = false,
  showFooter = false,
  cardColor,
  className = "",
}: ItemCardSkeletonProps) {
  // Wallet list and transaction list variants use simpler structure
  if (variant === "wallet-list" || variant === "transaction-list") {
    return (
      <div
        className={`bg-surface-card border border-border rounded-xl p-4 ${variant === "wallet-list" ? "py-2 px-4" : ""} ${className}`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {showIcon && (
              <div className="w-9 h-9 rounded-lg bg-border/40 animate-pulse shrink-0" />
            )}
            <div className="space-y-2">
              <div className="h-3 w-32 bg-border/40 rounded animate-pulse" />
              <div className="h-2 w-24 bg-border/40 rounded animate-pulse" />
            </div>
          </div>
          <div className="h-4 w-20 bg-border/40 rounded animate-pulse shrink-0" />
        </div>
      </div>
    );
  }

  // Standard FinancialCard variant
  const accentBarStyle = cardColor ? { backgroundColor: cardColor } : {};

  return (
    <div
      className={`bg-surface-card border border-border hover:border-border-strong rounded-2xl p-5 flex flex-col justify-between transition-all relative overflow-hidden ${className}`}
    >
      {/* Colored accent bar */}
      {cardColor && (
        <div
          className="absolute left-0 top-0 bottom-0 w-[3px] opacity-40"
          style={accentBarStyle}
        />
      )}

      {/* Top section */}
      <div className="w-full relative z-10">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3 min-w-0">
            {/* Icon */}
            {showIcon && (
              <div className="w-9 h-9 rounded-lg bg-border/40 animate-pulse shrink-0" />
            )}

            {/* Title + Badge */}
            <div className="min-w-0">
              <div className="h-4 w-40 bg-border/40 rounded animate-pulse mb-1" />
              {showBadge && (
                <div className="mt-1">
                  {badgeText ? (
                    <span className="text-[10px] text-text-secondary">{badgeText}</span>
                  ) : (
                    <div className="h-2 w-16 bg-border/40 rounded animate-pulse" />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          {showActions && (
            <div className="flex gap-1 shrink-0 opacity-0">
              <div className="w-7 h-7 rounded-full bg-border/40 animate-pulse" />
              <div className="w-7 h-7 rounded-full bg-border/40 animate-pulse" />
            </div>
          )}
        </div>

        {/* Two-column amounts (Debt/Goal style) */}
        {showTwoColumnAmounts && (
          <div className="mt-4 grid grid-cols-2 gap-2 relative z-10 w-full">
            <div>
              <div className="h-3 w-20 bg-border/40 rounded animate-pulse" />
              <div className="h-4 w-24 bg-border/40 rounded animate-pulse mt-1" />
            </div>
            <div className="text-right">
              <div className="h-3 w-20 bg-border/40 rounded animate-pulse ml-auto" />
              <div className="h-4 w-24 bg-border/40 rounded animate-pulse mt-1 ml-auto" />
            </div>
          </div>
        )}

        {/* Progress bar */}
        {showProgress && (
          <div className="mt-4 space-y-2 relative z-10 w-full">
            <div className="h-2 bg-border/40 rounded-full animate-pulse" />
            <div className="flex justify-between">
              <div className="h-3 w-16 bg-border/40 rounded animate-pulse" />
              <div className="h-3 w-12 bg-border/40 rounded animate-pulse" />
            </div>
          </div>
        )}
      </div>

      {/* Card footer */}
      {showFooter && (
        <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between gap-2 relative z-10 w-full">
          <div className="flex items-center gap-1">
            <div className="w-3.5 h-3.5 bg-border/40 rounded animate-pulse" />
            <div className="h-3 w-24 bg-border/40 rounded animate-pulse" />
          </div>
          <div className="h-3 w-16 bg-border/40 rounded animate-pulse" />
        </div>
      )}
    </div>
  );
}

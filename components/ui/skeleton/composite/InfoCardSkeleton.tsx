/**
 * InfoCardSkeleton - Stats/info card skeleton matching InfoCard component.
 * Displays real text title with blank value placeholder.
 */

type InfoCardVariant =
  | "primary"
  | "success"
  | "danger"
  | "warning"
  | "info"
  | "neutral"
  | "income"
  | "expense"
  | "transfer"
  | "owe"
  | "lend";

interface InfoCardSkeletonProps {
  title: string; // REQUIRED: Real text label
  variant?: InfoCardVariant;
  valueWidth?: string;
  showDescription?: boolean;
  description?: string; // Real text description
  valueAsZero?: boolean; // Show "0" for numeric values
  className?: string;
}

const valueColors: Record<InfoCardVariant, string> = {
  primary: "text-primary",
  success: "text-success",
  danger: "text-danger",
  warning: "text-warning",
  info: "text-info",
  neutral: "text-text-primary",
  income: "text-income",
  expense: "text-expense",
  transfer: "text-transfer",
  owe: "text-debt-owe",
  lend: "text-debt-lend",
};

export function InfoCardSkeleton({
  title,
  variant = "neutral",
  valueWidth = "w-32",
  showDescription = false,
  description,
  valueAsZero = false,
  className = "",
}: InfoCardSkeletonProps) {
  const valueColorClass = valueColors[variant] || valueColors.neutral;

  return (
    <div
      className={`bg-surface-card border border-border rounded-2xl p-5 ${className}`}
    >
      {/* Title - always shown as real text */}
      <p className="text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">
        {title}
      </p>

      {/* Value - blank skeleton or "Rp 0" */}
      {valueAsZero ? (
        <p className={`text-2xl font-bold mt-2 font-mono ${valueColorClass}`}>
          Rp 0
        </p>
      ) : (
        <div className={`h-7 ${valueWidth} bg-border/40 rounded animate-pulse mt-2`} />
      )}

      {/* Description */}
      {showDescription && (
        <p className="text-[10px] text-text-secondary mt-1">
          {description || "Loading..."}
        </p>
      )}
    </div>
  );
}

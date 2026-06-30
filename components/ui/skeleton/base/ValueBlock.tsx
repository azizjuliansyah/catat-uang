/**
 * ValueBlock - A reusable blank value placeholder for skeleton UI.
 * Used for numeric values, amounts, and any content that should appear blank during loading.
 */

interface ValueBlockProps {
  width?: string;
  height?: string;
  className?: string;
}

export function ValueBlock({
  width = "w-24",
  height = "h-7",
  className = "",
}: ValueBlockProps) {
  return (
    <div
      className={`bg-border/40 rounded animate-pulse ${width} ${height} ${className}`.trim()}
      aria-hidden="true"
    />
  );
}

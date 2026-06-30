import React from "react";

interface SelectionPillProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  variant?: "default" | "colored";
  color?: string; // Hex color for colored variant
  icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}

export function SelectionPill({
  active = false,
  variant = "colored",
  color,
  icon: Icon,
  children,
  className = "",
  style,
  ...props
}: SelectionPillProps) {
  // Styles based on active state and variant
  let activeStyle: React.CSSProperties | undefined = undefined;

  if (active) {
    if (variant === "colored" && color) {
      activeStyle = {
        backgroundColor: `${color}15`,
        borderColor: color,
        color: color,
      };
    } else {
      activeStyle = {
        backgroundColor: "var(--color-primary-light, rgba(59, 130, 246, 0.1))",
        borderColor: "var(--color-primary, #3b82f6)",
        color: "var(--color-primary, #3b82f6)",
      };
    }
  }

  return (
    <button
      type="button"
      style={{ ...activeStyle, ...style }}
      className={`
        flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border
        transition-all duration-150 ease-in-out cursor-pointer select-none
        ${
          active
            ? "border-border-strong font-semibold"
            : "bg-surface-card border-border/30 text-text-muted opacity-60 hover:opacity-100 hover:border-border-strong/50"
        }
        ${className}
      `}
      {...props}
    >
      {Icon && (
        <Icon
          className="w-3 h-3 shrink-0"
          style={active && color && variant === "colored" ? { color } : undefined}
        />
      )}
      <span>{children}</span>
    </button>
  );
}

import React, { forwardRef, useState } from "react";

interface FinancialCardProps extends React.HTMLAttributes<HTMLDivElement> {
  cardColor: string;
  isDragging?: boolean;
  children: React.ReactNode;
}

export const FinancialCard = forwardRef<HTMLDivElement, FinancialCardProps>(
  ({ cardColor, isDragging = false, children, style: propStyle, className = "", ...props }, ref) => {
    const [isHovered, setIsHovered] = useState(false);

    const style: React.CSSProperties = {
      ...propStyle,
      zIndex: isDragging ? 50 : propStyle?.zIndex,
      borderWidth: "1px",
      borderStyle: isDragging ? "dashed" : "solid",
      borderColor: isDragging
        ? "var(--color-primary)"
        : isHovered
        ? `${cardColor}45`
        : "var(--color-border)",
      background: isDragging
        ? "var(--color-surface-hover)"
        : isHovered
        ? `radial-gradient(circle at 100% 0%, ${cardColor}15, transparent 55%), var(--color-surface-card)`
        : `radial-gradient(circle at 100% 0%, ${cardColor}05, transparent 40%), var(--color-surface-card)`,
      boxShadow: isHovered
        ? `0 12px 30px -10px ${cardColor}1a`
        : "none",
    };

    return (
      <div
        ref={ref}
        style={style}
        onMouseEnter={(e) => {
          setIsHovered(true);
          props.onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          setIsHovered(false);
          props.onMouseLeave?.(e);
        }}
        className={`rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group transition-all duration-300 select-none ${
          isDragging ? "opacity-40" : "hover:-translate-y-1"
        } ${className}`}
        {...props}
      >
        {/* Left Accent Bar */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[3px] transition-all duration-300"
          style={{
            backgroundColor: cardColor,
            opacity: isHovered ? 0.9 : 0.4
          }}
        />

        {/* Ambient background decoration */}
        <div
          className="absolute -top-12 -left-12 w-24 h-24 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-all duration-500 pointer-events-none"
          style={{ backgroundColor: cardColor }}
        />

        {children}
      </div>
    );
  }
);

FinancialCard.displayName = "FinancialCard";

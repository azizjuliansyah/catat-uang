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
        ? "var(--color-accent-primary)"
        : isHovered
        ? `${cardColor}45`
        : "var(--color-border-default)",
      background: isDragging
        ? "var(--color-bg-subtle)"
        : isHovered
        ? `radial-gradient(circle at 100% 0%, ${cardColor}15, transparent 55%), var(--color-bg-elevated)`
        : `radial-gradient(circle at 100% 0%, ${cardColor}05, transparent 40%), var(--color-bg-elevated)`,
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
        className={`rounded-lg p-5 flex flex-col justify-between relative overflow-hidden group transition-all duration-150 ease select-none ${
          isDragging ? "opacity-40" : ""
        } ${className}`}
        {...props}
      >
        {/* Left Accent Bar */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[3px] transition-all duration-150 ease"
          style={{
            backgroundColor: cardColor,
            opacity: isHovered ? 0.9 : 0.4
          }}
        />

        {children}
      </div>
    );
  }
);

FinancialCard.displayName = "FinancialCard";

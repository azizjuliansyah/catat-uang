import React, { useState, useRef } from "react";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
  className?: string;
}

export function Tooltip({
  content,
  children,
  position = "top",
  delay = 250, // 200ms - 300ms delay as requested in design.md
  className = "",
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div
          className={`absolute z-50 pointer-events-none whitespace-normal max-w-xs bg-surface-card border border-border text-xxs font-medium text-text-primary px-2.5 py-1.5 rounded shadow-lg animate-fade-in
            ${position === "top" ? "bottom-full left-1/2 -translate-x-1/2 mb-2" : ""}
            ${position === "bottom" ? "top-full left-1/2 -translate-x-1/2 mt-2" : ""}
            ${position === "left" ? "right-full top-1/2 -translate-y-1/2 mr-2" : ""}
            ${position === "right" ? "left-full top-1/2 -translate-y-1/2 ml-2" : ""}
          `}
          role="tooltip"
        >
          {content}
        </div>
      )}
    </div>
  );
}

import React from "react";
import { TabButton, type TabButtonProps } from "./TabButton";

export { TabButton };
export type { TabButtonProps };

interface TabButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "underline" | "pill" | "pill-colored";
  fullWidth?: boolean;
  uniformWidth?: boolean;
  className?: string;
}

export function TabButtonGroup({
  children,
  variant = "pill",
  fullWidth = false,
  uniformWidth = false,
  className = "",
  ...props
}: TabButtonGroupProps) {
  const variantClasses = {
    underline: "border-b border-border",
    pill: "bg-surface-input p-1 border border-border rounded-xl",
    "pill-colored": "bg-surface-input p-1 border border-border rounded-xl",
  };

  const containerClasses = fullWidth ? "flex" : uniformWidth ? "grid grid-cols-2" : "flex";

  // Clone children to add uniform width class
  const enhancedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child) && child.type === TabButton) {
      const childProps = child.props as TabButtonProps;
      return React.cloneElement(child, {
        className: uniformWidth
          ? `flex-1 ${childProps.className || ""}`
          : childProps.className,
      } as TabButtonProps);
    }
    return child;
  });

  return (
    <div
      className={`${variantClasses[variant]} ${containerClasses} ${className}`}
      {...props}
    >
      {enhancedChildren}
    </div>
  );
}

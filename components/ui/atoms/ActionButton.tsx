import React from "react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface ActionButtonBaseProps {
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
  title: string;
  variant?: "ghost" | "danger" | "success" | "primary";
  size?: "sm" | "md" | "lg";
  iconClassName?: string;
  isSelected?: boolean;
  selectedColor?: string;
}

// Support both standard button and Link element
type ActionButtonProps = ActionButtonBaseProps &
  (
    | (React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined })
    | (React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string })
  );

export function ActionButton({
  icon: Icon,
  title,
  variant = "ghost",
  size = "md",
  iconClassName = "",
  className = "",
  isSelected = false,
  selectedColor,
  style,
  ...props
}: ActionButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center rounded-lg transition-all duration-200 cursor-pointer select-none active:scale-[0.95] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 shrink-0";

  const variantClasses = {
    ghost:
      "bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-hover border border-transparent",
    danger:
      "bg-transparent text-text-secondary hover:text-danger hover:bg-danger/10 border border-transparent",
    success:
      "bg-transparent text-text-secondary hover:text-success hover:bg-success/10 border border-transparent",
    primary:
      "bg-transparent text-text-secondary hover:text-primary hover:bg-primary/10 border border-transparent",
  };

  const sizeClasses = {
    sm: "h-8 w-8 p-2",      // 36px touch target
    md: "h-9 w-9 p-2",    // 40px touch target
    lg: "h-12 w-12 p-2",    // 48px touch target
  };

  const iconSizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-8 h-8",
  };

  const combinedClassName = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  const iconCombinedClassName = `${iconSizeClasses[size]} shrink-0 ${iconClassName}`;

  const combinedStyle = isSelected && selectedColor
    ? { ...style, backgroundColor: selectedColor, borderColor: selectedColor, color: "white" }
    : style;

  if (props.href) {
    const { href, ...anchorProps } = props as React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };
    return (
      <Link
        href={href}
        title={title}
        className={combinedClassName}
        style={combinedStyle}
        {...(anchorProps as any)}
      >
        <Icon className={iconCombinedClassName} />
      </Link>
    );
  }

  const { type = "button", ...buttonProps } = props as React.ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button
      type={type}
      title={title}
      className={combinedClassName}
      style={combinedStyle}
      {...buttonProps}
    >
      <Icon className={iconCombinedClassName} />
    </button>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { ExternalLink, LucideIcon } from "lucide-react";

export type DetailLinkVariant = "primary" | "secondary" | "neutral";
export type DetailLinkSize = "sm" | "md";

interface DetailLinkProps {
  href: string;
  label?: string;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  variant?: DetailLinkVariant;
  size?: DetailLinkSize;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

const variantClasses: Record<DetailLinkVariant, string> = {
  primary: "text-primary hover:text-primary/80 bg-transparent hover:bg-surface-hover",
  secondary: "text-text-secondary hover:text-text-primary bg-transparent hover:bg-surface-hover",
  neutral: "text-text-primary hover:text-text-secondary bg-transparent hover:bg-surface-hover",
};

const sizeClasses: Record<DetailLinkSize, string> = {
  sm: "text-[11px] px-2 py-1 rounded-md",
  md: "text-xs px-2.5 py-1.5 rounded-md",
};

const iconSizes: Record<DetailLinkSize, string> = {
  sm: "w-3 h-3",
  md: "w-4 h-4",
};

export function DetailLink({
  href,
  label = "Lihat Detail",
  icon: Icon = ExternalLink,
  iconPosition = "left",
  variant = "primary",
  size = "sm",
  className = "",
  onClick,
}: DetailLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`${variantClasses[variant]} ${sizeClasses[size]} font-semibold flex items-center gap-1 transition-all duration-150 ease-in-out ${className}`}
    >
      {iconPosition === "left" && <Icon className={iconSizes[size]} />}
      {label}
      {iconPosition === "right" && <Icon className={iconSizes[size]} />}
    </Link>
  );
}

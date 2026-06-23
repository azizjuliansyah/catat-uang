"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, LucideIcon } from "lucide-react";

export type DetailHeaderBadgeVariant =
  | "primary"
  | "success"
  | "danger"
  | "warning"
  | "neutral"
  | "owe"
  | "lend";

export interface DetailHeaderBadge {
  label: string;
  variant: DetailHeaderBadgeVariant;
  icon?: React.ReactNode;
  pulse?: boolean;
}

export interface DisplayCard {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

interface DetailPageHeaderProps {
  // Navigation
  backHref?: string;
  backLabel?: string;
  backIcon?: LucideIcon;

  // Main content
  title: string;
  subtitle?: string;
  badges?: DetailHeaderBadge[];

  // Gradient card display (optional)
  displayCard?: DisplayCard;

  // Actions
  actions?: React.ReactNode;

  // Additional meta info below the header
  meta?: React.ReactNode;

  className?: string;
}

/**
 * Detail page header component with back navigation, badges, display card, and actions.
 *
 * @example
 * <DetailPageHeader
 *   backHref="/debts"
 *   title={debt.name}
 *   badges={[
 *     { label: "Hutang Saya", variant: "owe" },
 *     { label: "Belum Lunas", variant: "danger", pulse: true }
 *   ]}
 *   displayCard={{ label: "Sisa Tagihan", value: formatIDR(remaining) }}
 *   actions={
 *     <>
 *       <Button onClick={onEdit}>Ubah</Button>
 *       <Button onClick={onDelete}>Hapus</Button>
 *     </>
 *   }
 * />
 */
export function DetailPageHeader({
  backHref,
  backLabel = "Kembali",
  backIcon: BackIcon = ArrowLeft,
  title,
  subtitle,
  badges = [],
  displayCard,
  actions,
  meta,
  className = "",
}: DetailPageHeaderProps) {
  // Badge variant classes
  const badgeVariantClasses: Record<DetailHeaderBadgeVariant, string> = {
    primary: "bg-primary/10 text-primary border border-primary/20",
    success: "bg-success/10 text-success border border-success/20",
    danger: "bg-danger/10 text-danger border border-danger/20",
    warning: "bg-warning/10 text-warning border border-warning/20",
    neutral: "bg-text-secondary/15 text-text-secondary border border-border",
    owe: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
    lend: "bg-cyan-500/10 text-cyan-500 border border-cyan-500/20",
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Navigation and Top Toolbar */}
      <div className="flex flex-row justify-between">
        {backHref && (
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-text-primary transition-colors"
          >
            <BackIcon className="w-4 h-4" />
            {backLabel}
          </Link>
        )}

        {actions && (
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {actions}
          </div>
        )}
      </div>

      {/* Gradient Card Display */}
      <div className="bg-gradient-to-r from-surface-card to-surface/20 border border-border rounded-3xl p-6 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left: Title, badges, subtitle */}
          <div className="space-y-2">
            {/* Badges */}
            {badges.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {badges.map((badge, index) => (
                  <span
                    key={index}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 ${
                      badge.pulse ? "animate-pulse" : ""
                    } ${badgeVariantClasses[badge.variant]}`}
                  >
                    {badge.icon}
                    {badge.label}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              {title}
            </h1>

            {/* Subtitle */}
            {subtitle && (
              <p className="text-xs text-text-secondary">{subtitle}</p>
            )}
          </div>

          {/* Right: Display Card (optional) */}
          {displayCard && (
            <div className="text-right space-y-1">
              <p className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider">
                {displayCard.label}
              </p>
              <p className="text-3xl font-extrabold text-text-primary tracking-tight font-mono">
                {displayCard.value}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Meta info */}
      {meta && (
        <div className="flex items-center justify-end text-sm text-text-secondary">
          {meta}
        </div>
      )}
    </div>
  );
}

"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string; // Alias for subtitle
  icon?: LucideIcon | React.ReactNode;
  iconClassName?: string;
  actions?: React.ReactNode;
  backLink?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  meta?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  actionsClassName?: string;
}

/**
 * Page header component with icon, title, description, and action buttons.
 *
 * @example
 * <PageHeader
 *   icon={ArrowRightLeft}
 *   title="Daftar Transaksi"
 *   description="Lihat, cari, filter, dan kelola semua catatan keuangan Anda."
 *   actions={
 *     <>
 *       <Button onClick={onAction}>Action</Button>
 *     </>
 *   }
 * />
 */
export function PageHeader({
  title,
  subtitle,
  description,
  icon: Icon,
  iconClassName = "w-6 h-6 text-primary",
  actions,
  backLink,
  breadcrumbs,
  meta,
  className = "",
  headerClassName = "",
  actionsClassName = "",
}: PageHeaderProps) {
  // Use description if provided, otherwise fall back to subtitle
  const finalDescription = description || subtitle;

  return (
    <div className={`space-y-4 ${className}`}>
      {breadcrumbs && <div className="flex items-center">{breadcrumbs}</div>}

      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${headerClassName}`}>
        <div className="flex-1">
          {backLink && <div className="mb-2">{backLink}</div>}
          <h1 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2 font-display">
            {Icon && (
              React.isValidElement(Icon) ? (
                React.cloneElement(Icon as React.ReactElement<any>, {
                  className: iconClassName,
                })
              ) : (typeof Icon === "function" || (typeof Icon === "object" && Icon !== null && "$$typeof" in Icon)) ? (
                React.createElement(Icon as React.ComponentType<any>, { className: iconClassName })
              ) : (
                Icon as any
              )
            )}
            {title}
          </h1>
          {finalDescription && (
            <p className="text-xs text-text-secondary mt-1">{finalDescription}</p>
          )}
        </div>

        {actions && (
          <div className={`flex gap-2 w-full sm:w-auto ${actionsClassName}`}>
            {actions}
          </div>
        )}
      </div>

      {meta && (
        <div className="flex items-center justify-end text-sm text-text-secondary">
          {meta}
        </div>
      )}
    </div>
  );
}

import React from "react";
import { LucideIcon, FileImage, ExternalLink, HelpCircle } from "lucide-react";
import { getIconComponent } from "@/lib/utils/icons";
import { formatIDR } from "@/lib/utils/format";

/**
 * DetailHeader - Header section with icon, labels, and amount
 * Used for the top section of detail views (transaction detail, wallet detail, etc.)
 */
interface DetailHeaderProps {
  icon: string | LucideIcon | React.ComponentType<{ className?: string }>;
  iconColor?: string;
  title: string;
  subtitle?: React.ReactNode;
  amount?: number;
  amountPrefix?: string;
  amountColorClass?: string;
  rightContent?: React.ReactNode;
}

export function DetailHeader({
  icon,
  iconColor = "#6B7280",
  title,
  subtitle,
  amount,
  amountPrefix = "",
  amountColorClass = "text-text-primary",
  rightContent,
}: DetailHeaderProps) {
  const IconComponent = typeof icon === "string" ? getIconComponent(icon) : icon;

  return (
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-lg flex items-center justify-center text-white shrink-0"
          style={{ backgroundColor: iconColor }}
        >
          <IconComponent className="w-7 h-7" />
        </div>
        <div>
          <p className="text-sm font-medium text-text-secondary">
            {title}
          </p>
          {subtitle && (
            <p className="text-xs text-text-secondary mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {rightContent || (amount !== undefined && (
        <div className="text-right">
          <p className={`text-2xl font-bold font-mono ${amountColorClass}`}>
            {amountPrefix}{formatIDR(amount)}
          </p>
        </div>
      ))}
    </div>
  );
}

/**
 * DetailDescriptionCard - Card for showing description/text content
 */
interface DetailDescriptionCardProps {
  label: string;
  children: React.ReactNode;
}

export function DetailDescriptionCard({ label, children }: DetailDescriptionCardProps) {
  return (
    <div className="bg-surface-card border border-border rounded-lg p-4">
      <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-2">
        {label}
      </p>
      <div className="text-sm text-text-primary whitespace-pre-wrap">
        {children}
      </div>
    </div>
  );
}

/**
 * DetailItemCard - Small card showing icon + label + value
 * Used in grid layouts for showing related items (source, category, etc.)
 */
interface DetailItemCardProps {
  label: string;
  icon?: string | LucideIcon | React.ComponentType<{ className?: string }>;
  iconColor?: string;
  value: string;
  valueColor?: string;
}

export function DetailItemCard({
  label,
  icon,
  iconColor = "#6B7280",
  value,
  valueColor = "text-text-primary",
}: DetailItemCardProps) {
  const IconComponent = icon
    ? typeof icon === "string"
      ? getIconComponent(icon)
      : icon
    : HelpCircle;

  return (
    <div className="bg-surface-card border border-border rounded-lg p-3">
      <div className="flex items-center gap-2 mb-2">
        <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
          {label}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {icon && (
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center text-white shrink-0"
            style={{ backgroundColor: iconColor }}
          >
            <IconComponent className="w-3 h-3" />
          </div>
        )}
        <p className={`text-sm font-medium ${valueColor} truncate`}>
          {value}
        </p>
      </div>
    </div>
  );
}

/**
 * DetailStatsGrid - Grid wrapper for detail stat cards
 * Shows stats with icon, value, and description
 */
interface DetailStatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  description: string;
  valueColorClass?: string;
  iconColorClass?: string;
}

export function DetailStatCard({
  icon: Icon,
  label,
  value,
  description,
  valueColorClass = "text-text-primary",
  iconColorClass = "text-text-secondary",
}: DetailStatCardProps) {
  return (
    <div className="bg-surface-card border border-border rounded-lg p-3">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-3 h-3 ${iconColorClass}`} />
        <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
          {label}
        </p>
      </div>
      <p className={`text-lg font-bold font-mono ${valueColorClass}`}>
        {value}
      </p>
      <p className="text-xs text-text-muted mt-1">
        {description}
      </p>
    </div>
  );
}

interface DetailStatsGridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
}

export function DetailStatsGrid({ children, cols = 3 }: DetailStatsGridProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  }[cols];

  return <div className={`grid ${gridCols} gap-3`}>{children}</div>;
}

/**
 * DetailImageCard - Card for showing images/receipts
 */
interface DetailImageCardProps {
  label: string;
  url: string;
  externalLink?: string;
  aspectRatio?: "square" | "video" | "wide";
}

export function DetailImageCard({
  label,
  url,
  externalLink,
  aspectRatio = "video",
}: DetailImageCardProps) {
  const [imageLoading, setImageLoading] = React.useState(true);
  const [imageError, setImageError] = React.useState(false);

  const aspectClass = {
    square: "aspect-square",
    video: "aspect-video",
    wide: "aspect-[16/9]",
  }[aspectRatio];

  return (
    <div className="bg-surface-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
          {label}
        </p>
        {externalLink && (
          <a
            href={externalLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            <ExternalLink className="w-3 h-3" />
            Buka di Tab Baru
          </a>
        )}
      </div>
      <div className={`relative w-full ${aspectClass} rounded-lg overflow-hidden bg-surface-hover`}>
        {imageError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-text-muted">
            <FileImage className="w-8 h-8 mb-2" />
            <p className="text-xs">Gagal memuat gambar</p>
          </div>
        ) : (
          <>
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-surface-hover">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <img
              src={url}
              alt={label}
              className="w-full h-full object-contain"
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false);
                setImageError(true);
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}

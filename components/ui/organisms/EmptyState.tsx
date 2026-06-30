import React from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "../atoms/Button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 border border-dashed border-border rounded-lg bg-surface-card/50 w-full ${className}`}
    >
      <div className="w-14 h-14 rounded-lg bg-surface-hover flex items-center justify-center mb-4 text-text-tertiary">
        <Icon className="w-7 h-7" />
      </div>
      <h4 className="text-section-title text-text-primary font-display mb-2">
        {title}
      </h4>
      <p className="text-body text-text-secondary leading-relaxed max-w-lg mb-5">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

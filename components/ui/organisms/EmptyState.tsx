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
      className={`flex flex-col items-center justify-center text-center p-8 border border-dashed border-border rounded-2xl bg-surface-card/20 max-w-md mx-auto ${className}`}
    >
      <div className="w-14 h-14 rounded-xl bg-surface-hover/50 flex items-center justify-center mb-4 text-text-secondary/30">
        <Icon className="w-7 h-7" />
      </div>
      <h4 className="text-base font-bold text-text-primary tracking-tight font-display mb-1.5">
        {title}
      </h4>
      <p className="text-xs text-text-secondary leading-relaxed max-w-xs mb-5">
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

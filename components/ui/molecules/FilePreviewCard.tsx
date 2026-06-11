"use client";

import React from "react";
import { ImageIcon, ExternalLink, Trash2, RotateCcw, X } from "lucide-react";
import { ActionButton } from "@/components/ui/atoms/ActionButton";

interface FilePreviewCardProps {
  file?: File;
  preview?: string;
  existingUrl?: string;
  isDeleted?: boolean;
  onDelete: () => void;
  onRestore?: () => void;
  name?: string;
  size?: number;
  index?: number;
  className?: string;
}

export function FilePreviewCard({
  file,
  preview,
  existingUrl,
  isDeleted = false,
  onDelete,
  onRestore,
  name,
  size,
  index = 0,
  className = "",
}: FilePreviewCardProps) {
  const displayName = name || file?.name || `Bukti ${index + 1}`;
  const displaySize = size || file?.size || 0;
  const imageSrc = preview || existingUrl;

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
  };

  const isNewFile = !!file;

  return (
    <div
      className={`border rounded-xl p-3 flex items-center justify-between transition-all relative overflow-hidden ${
        isDeleted
          ? "bg-danger/5 border-danger/20 opacity-70"
          : "bg-surface-input border-border hover:border-border-strong"
      } ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0 z-10">
        <div className="relative shrink-0">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={displayName}
              className={`w-10 h-10 rounded object-cover border transition-all ${
                isDeleted ? "border-danger/30 filter grayscale sepia" : "border-border"
              }`}
            />
          ) : (
            <div className="w-10 h-10 rounded bg-surface-card border border-border flex items-center justify-center text-text-secondary shrink-0">
              <ImageIcon className="w-5 h-5" />
            </div>
          )}
          {isDeleted && (
            <div className="absolute inset-0 bg-danger/25 rounded flex items-center justify-center">
              <X className="w-4 h-4 text-danger-strong" />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className={`text-xs font-semibold truncate ${isDeleted ? "text-danger-strong line-through" : "text-text-primary"}`}>
            {displayName}
          </p>
          {existingUrl && !isDeleted ? (
            <a
              href={existingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xxs text-primary hover:underline flex items-center gap-0.5 mt-0.5"
            >
              Buka gambar <ExternalLink className="w-2.5 h-2.5" />
            </a>
          ) : isNewFile && !isDeleted ? (
            <p className="text-xxs text-text-secondary">{formatFileSize(displaySize)}</p>
          ) : null}
        </div>
      </div>

      <ActionButton
        variant={isDeleted ? "primary" : "danger"}
        size="sm"
        icon={isDeleted ? RotateCcw : Trash2}
        title={isDeleted ? "Batal Hapus" : "Hapus"}
        onClick={isDeleted ? onRestore : onDelete}
        className="z-10"
      />
    </div>
  );
}

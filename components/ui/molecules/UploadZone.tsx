"use client";

import React from "react";
import { UploadCloud } from "lucide-react";

interface UploadZoneProps {
  onFileSelect: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  label?: string;
  helperText?: string;
  className?: string;
}

export function UploadZone({
  onFileSelect,
  accept = "image/*",
  multiple = false,
  maxSize = 5 * 1024 * 1024, // 5MB default
  label = "Pilih file",
  helperText,
  className = "",
}: UploadZoneProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      // Validate sizes
      const oversized = selectedFiles.some((f) => f.size > maxSize);
      if (oversized) {
        console.error(`Ukuran file maksimal adalah ${(maxSize / 1024 / 1024).toFixed(0)}MB`);
        return;
      }
      onFileSelect(selectedFiles);
    }
    // Reset input value so same file can be selected again if removed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div
        onClick={handleClick}
        className="bg-surface-input border border-border border-dashed hover:border-border-strong rounded-lg p-4 text-center cursor-pointer hover:bg-surface-hover transition-colors duration-150 ease flex flex-col items-center justify-center gap-1.5"
      >
        <div className="w-8 h-8 rounded-md bg-surface-card border border-border flex items-center justify-center text-text-secondary">
          <UploadCloud className="w-4 h-4" />
        </div>
        <div>
          <p className="text-xs font-semibold text-text-primary">{label}</p>
          {helperText && (
            <p className="text-[10px] text-text-secondary mt-0.5">{helperText}</p>
          )}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          accept={accept}
          className="hidden"
          multiple={multiple}
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}

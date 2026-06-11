"use client";

import { useToast } from "@/components/ui/molecules/Toast";
import { UploadZone } from "@/components/ui/molecules/UploadZone";
import { FilePreviewCard } from "@/components/ui/molecules/FilePreviewCard";

interface ProofUploaderProps {
  label?: string;
  proofFiles: File[] | null | undefined;
  proofPreviews: string[] | null | undefined;
  existingProofUrls?: string[] | null;
  shouldDeleteProofUrls?: string[] | null;
  onFilesChange: (files: File[] | null) => void;
  onDeleteExistingChange?: (url: string, val: boolean) => void;
}

export function ProofUploader({
  label = "Lampirkan Bukti (Opsional)",
  proofFiles,
  proofPreviews,
  existingProofUrls,
  shouldDeleteProofUrls,
  onFilesChange,
  onDeleteExistingChange
}: ProofUploaderProps) {
  const { error: showErrorToast } = useToast();

  const handleFileSelect = (selectedFiles: File[]) => {
    if (selectedFiles.length > 0) {
      const currentFiles = proofFiles || [];
      const updatedFiles = [...currentFiles, ...selectedFiles];
      onFilesChange(updatedFiles);
    }
  };

  const handleRemoveNewFile = (index: number) => {
    if (!proofFiles) return;
    const updatedFiles = proofFiles.filter((_, i) => i !== index);
    onFilesChange(updatedFiles.length > 0 ? updatedFiles : null);
  };

  const isExistingDeleted = (url: string) => {
    return shouldDeleteProofUrls?.includes(url) || false;
  };

  const hasExisting = existingProofUrls && existingProofUrls.length > 0;
  const hasNew = proofFiles && proofFiles.length > 0;

  return (
    <div className="space-y-3">
      <label className="text-xs font-semibold text-text-secondary flex items-center justify-between">
        <span>{label}</span>
        {(hasExisting || hasNew) && (
          <span className="text-[10px] text-text-muted">
            {((existingProofUrls?.length || 0) - (shouldDeleteProofUrls?.length || 0) + (proofFiles?.length || 0))} file terlampir
          </span>
        )}
      </label>

      {/* Grid containing both existing and new files */}
      {(hasExisting || hasNew) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1">
          {/* Existing Files */}
          {existingProofUrls?.map((url, index) => {
            const deleted = isExistingDeleted(url);
            return (
              <FilePreviewCard
                key={`existing-${index}`}
                existingUrl={url}
                isDeleted={deleted}
                name={`Bukti Terunggah #${index + 1}`}
                onDelete={() => onDeleteExistingChange?.(url, true)}
                onRestore={() => onDeleteExistingChange?.(url, false)}
              />
            );
          })}

          {/* New Files */}
          {proofFiles?.map((file, index) => {
            const preview = proofPreviews?.[index];
            return (
              <FilePreviewCard
                key={`new-${index}`}
                file={file}
                preview={preview}
                name={file.name}
                size={file.size}
                onDelete={() => handleRemoveNewFile(index)}
              />
            );
          })}
        </div>
      )}

      {/* Upload Zone */}
      <UploadZone
        onFileSelect={handleFileSelect}
        accept="image/jpeg,image/png,image/webp"
        multiple
        maxSize={5 * 1024 * 1024}
        label="Pilih file bukti / kwitansi"
        helperText="Mendukung banyak gambar (JPG, PNG, WebP). Maks 5MB per file."
      />
    </div>
  );
}

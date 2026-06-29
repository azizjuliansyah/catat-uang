"use client";

import { ActionButton } from "@/components/ui/atoms/ActionButton";
import { Button } from "@/components/ui/atoms/Button";
import { UploadZone } from "@/components/ui/molecules/UploadZone";
import { FilePreviewCard } from "@/components/ui/molecules/FilePreviewCard";

interface ReceiptManagerProps {
  receiptFile: File | null;
  receiptPreview: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  existingReceiptUrl?: string | null;
  shouldDeleteExistingReceipt?: boolean;
  setShouldDeleteExistingReceipt?: (val: boolean) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  type?: "expense" | "income";
}

export function ReceiptManager({
  receiptFile,
  receiptPreview,
  onFileChange,
  onRemove,
  existingReceiptUrl,
  shouldDeleteExistingReceipt = false,
  setShouldDeleteExistingReceipt,
  fileInputRef,
  type
}: ReceiptManagerProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-text-secondary">
        {type === "income" ? "Lampirkan Bukti" : "Lampirkan Nota"} (Opsional)
      </label>

      {/* Hidden file input for file selection */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={onFileChange}
        className="hidden"
      />

      {/* Existing Receipt Preview */}
      {existingReceiptUrl && !shouldDeleteExistingReceipt && (
        <FilePreviewCard
          existingUrl={existingReceiptUrl}
          name={type === "income" ? "Bukti Terunggah" : "Nota Terunggah"}
          onDelete={() => setShouldDeleteExistingReceipt?.(true)}
        />
      )}

      {/* Upload Area for New Files */}
      {(!existingReceiptUrl || shouldDeleteExistingReceipt) && (
        <>
          {receiptFile ? (
            <FilePreviewCard
              file={receiptFile}
              preview={receiptPreview || undefined}
              name={receiptFile.name}
              size={receiptFile.size}
              onDelete={onRemove}
            />
          ) : (
            <div className="relative">
              <UploadZone
                onFileSelect={(files) => {
                  if (files.length > 0 && fileInputRef.current) {
                    // Manually set the files and trigger onChange
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(files[0]);
                    fileInputRef.current.files = dataTransfer.files;

                    const event = new Event("change", { bubbles: true });
                    Object.defineProperty(event, "target", {
                      writable: false,
                      value: fileInputRef.current
                    });
                    onFileChange(event as unknown as React.ChangeEvent<HTMLInputElement>);
                  }
                }}
                accept="image/jpeg,image/png,image/webp"
                maxSize={5 * 1024 * 1024}
                label={type === "income" ? "Pilih file bukti transaksi baru" : "Pilih file nota pembayaran baru"}
                helperText={type === "income" ? "Klik untuk memilih file foto/bukti. Maksimal 5MB." : "Klik untuk memilih file foto/nota. Maksimal 5MB."}
              />

              {shouldDeleteExistingReceipt && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShouldDeleteExistingReceipt?.(false)}
                  className="absolute right-3 top-3"
                >
                  {type === "income" ? "Urungkan Hapus Bukti Lama" : "Urungkan Hapus Nota Lama"}
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

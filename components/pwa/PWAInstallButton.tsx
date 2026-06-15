"use client";

import { useState } from "react";
import { useApp } from "@/app/providers/AppProvider";
import { Button } from "@/components/ui/atoms/Button";
import { Download } from "lucide-react";
import { useToast } from "@/components/ui/molecules/Toast";

export function PWAInstallButton() {
  const { isInstallable, triggerInstallPrompt } = useApp();
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  const [isInstalling, setIsInstalling] = useState(false);

  if (!isInstallable) {
    return null;
  }

  const handleInstallClick = async () => {
    setIsInstalling(true);
    try {
      const installed = await triggerInstallPrompt();
      if (installed) {
        showSuccessToast(
          "Aplikasi berhasil di-install! Anda sekarang dapat membukanya langsung dari beranda atau desktop."
        );
      }
    } catch (err) {
      console.error("PWA installation prompt failed:", err);
      showErrorToast("Gagal memulai proses instalasi.");
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleInstallClick}
      isLoading={isInstalling}
      className="gap-1.5 self-stretch sm:self-auto"
    >
      {!isInstalling && <Download className="w-4 h-4 shrink-0" />}
      Install Aplikasi
    </Button>
  );
}

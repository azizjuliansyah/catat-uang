"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Archive, RotateCcw, Star, Edit2, Trash2, ArrowRight, MoreVertical } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/molecules/Toast";
import { Button } from "@/components/ui/atoms/Button";
import { DropdownMenu } from "@/components/ui/molecules/DropdownMenu";
import { WalletItem } from "../../types";
import { toggleArchiveWallet, setDefaultWallet } from "../../services";

interface WalletDetailHeaderProps {
  wallet: WalletItem | null;
  onEdit?: () => void;
  onTransfer?: () => void;
  onDelete?: () => void;
}

export function WalletDetailHeader({
  wallet,
  onEdit,
  onTransfer,
  onDelete,
}: WalletDetailHeaderProps) {
  const supabase = createClient();
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Archive/Unarchive handler
  const handleToggleArchive = useCallback(async () => {
    if (!wallet) return;
    setIsActionLoading(true);
    try {
      const nextArchived = !wallet.is_archived;
      if (wallet.is_default && nextArchived) {
        showErrorToast("Dompet utama tidak bisa diarsipkan.");
        setIsActionLoading(false);
        return;
      }
      await toggleArchiveWallet(supabase, wallet.id, nextArchived);
      showSuccessToast(nextArchived ? "Dompet berhasil diarsipkan" : "Dompet berhasil diaktifkan kembali");
      // Refresh will happen via AppProvider
    } catch (err) {
      console.error(err);
      showErrorToast("Gagal mengubah status arsip dompet");
    } finally {
      setIsActionLoading(false);
    }
  }, [wallet, supabase, showSuccessToast, showErrorToast]);

  // Set default handler
  const handleSetDefault = useCallback(async () => {
    if (!wallet) return;
    setIsActionLoading(true);
    try {
      if (wallet.is_archived) {
        showErrorToast("Dompet terarsip tidak bisa dijadikan dompet utama.");
        setIsActionLoading(false);
        return;
      }
      await setDefaultWallet(supabase, wallet.id);
      showSuccessToast(`Dompet ${wallet.name} sekarang menjadi dompet utama!`);
      // Refresh will happen via AppProvider
    } catch (err) {
      console.error(err);
      showErrorToast("Gagal menjadikan dompet utama");
    } finally {
      setIsActionLoading(false);
    }
  }, [wallet, supabase, showSuccessToast, showErrorToast]);

  if (!wallet) return null;

  const mobileMenuItems = [
    ...(wallet.is_default || wallet.is_archived
      ? []
      : [
          {
            icon: Star,
            label: "Jadikan Utama",
            variant: "primary" as const,
            onClick: handleSetDefault,
          },
        ]),
    {
      icon: Edit2,
      label: "Ubah Dompet",
      variant: "default" as const,
      onClick: onEdit || (() => {}),
    },
    {
      icon: wallet.is_archived ? RotateCcw : Archive,
      label: wallet.is_archived ? "Aktifkan Kembali" : "Arsipkan",
      variant: "default" as const,
      onClick: handleToggleArchive,
    },
    ...(wallet.is_archived
      ? []
      : [
          {
            icon: ArrowRight,
            label: "Transfer",
            variant: "primary" as const,
            onClick: onTransfer || (() => {}),
          },
        ]),
    ...(wallet.is_default
      ? []
      : [
          {
            icon: Trash2,
            label: "Hapus Dompet",
            variant: "danger" as const,
            onClick: onDelete || (() => {}),
          },
        ]),
  ];

  return (
    <div className="flex flex-row justify-between items-center">
      <Link
        href="/wallets"
        className="inline-flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Dompet
      </Link>

      {/* Action Buttons */}
      <div className="hidden sm:flex items-center gap-2">
        {/* Archive/Unarchive */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleArchive}
          disabled={isActionLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-xs cursor-pointer text-text-secondary"
        >
          {wallet.is_archived ? (
            <>
              <RotateCcw className="w-3.5 h-3.5" />
              Aktifkan
            </>
          ) : (
            <>
              <Archive className="w-3.5 h-3.5" />
              Arsipkan
            </>
          )}
        </Button>

        {/* Set as Default - only if not already default and not archived */}
        {!wallet.is_default && !wallet.is_archived && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleSetDefault}
            disabled={isActionLoading}
            className="flex items-center gap-1.5 text-xs cursor-pointer"
          >
            <Star className="w-3.5 h-3.5" />
            Jadikan Utama
          </Button>
        )}

        {/* Edit */}
        <Button
          variant="warning"
          size="sm"
          onClick={onEdit}
          className="flex items-center gap-1.5 text-xs cursor-pointer"
        >
          <Edit2 className="w-3.5 h-3.5" />
          Ubah
        </Button>

        {/* Transfer */}
        {!wallet.is_archived && (
          <Button
            variant="primary"
            size="sm"
            onClick={onTransfer}
            className="flex items-center gap-1.5 text-xs cursor-pointer"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            Transfer
          </Button>
        )}

        {/* Delete - only if not default wallet */}
        {!wallet.is_default && (
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
            className="flex items-center gap-1.5 text-xs cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Hapus
          </Button>
        )}
      </div>

      {/* Mobile: Three-dot menu */}
      <div className="sm:hidden">
        <DropdownMenu
          triggerIcon={MoreVertical}
          triggerTitle="Menu Dompet"
          items={mobileMenuItems}
          align="right"
        />
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useApp } from "@/app/providers/AppProvider";
import { Button } from "@/components/ui/atoms/Button";
import { ActionButton } from "@/components/ui/atoms/ActionButton";
import { getIconComponent } from "@/lib/utils/icons";
import { Plus, Edit2, Trash2, FolderMinus, Calendar, Receipt, CreditCard, AlertCircle, ExternalLink } from "lucide-react";
import { PaylaterModal } from "./components/PaylaterModal";
import { DeletePaylaterModal } from "./components/DeletePaylaterModal";
import { PaylaterPaymentModal } from "./components/PaylaterPaymentModal";
import { formatIDR } from "@/lib/utils/format";
import { PaylaterBannerSkeleton, PaylaterGridSkeleton } from "./components/PaylaterSkeleton";

interface PaylaterPlatformItem {
  id: string;
  user_id: string;
  name: string;
  limit_amount: number;
  balance: number;
  billing_cycle_date: number;
  due_date_offset: number;
  icon: string;
  color: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export default function PaylaterPage() {
  const {
    paylaterPlatforms,
    loadingPaylaterPlatforms,
    refreshPaylaterPlatforms,
    refreshWallets
  } = useApp();

  // Modals state
  const [isPaylaterModalOpen, setIsPaylaterModalOpen] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<PaylaterPlatformItem | null>(null);
  const [platformToDelete, setPlatformToDelete] = useState<PaylaterPlatformItem | null>(null);

  const activePlatforms = paylaterPlatforms.filter((p) => !p.is_archived);

  // Summary calculations
  const totalLimit = activePlatforms.reduce((acc, p) => acc + p.limit_amount, 0);
  const totalUsed = activePlatforms.reduce((acc, p) => acc + p.balance, 0);
  const totalAvailable = totalLimit - totalUsed;
  const overallUsagePercentage = totalLimit > 0 ? Math.min((totalUsed / totalLimit) * 100, 100) : 0;

  const handleRefreshAll = () => {
    refreshPaylaterPlatforms();
    refreshWallets();
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2 font-display">
            <CreditCard className="w-6 h-6 text-primary" />
            Kelola Paylater
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Kelola batas kredit, siklus tagihan, jatuh tempo, dan bayar tagihan platform Paylater Anda.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingPlatform(null);
            setIsPaylaterModalOpen(true);
          }}
          size="sm"
          className="self-stretch sm:self-auto"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Platform Baru
        </Button>
      </div>

      {/* Summary Cards */}
      {loadingPaylaterPlatforms ? (
        <PaylaterBannerSkeleton />
      ) : activePlatforms.length > 0 && (
        <>
          {/* Progress Bar Card */}
          <div className="bg-surface-card border border-border rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-extrabold text-text-secondary uppercase tracking-wider">Persentase Penggunaan Limit</p>
              <span className="text-sm font-bold text-text-primary tabular-nums">{overallUsagePercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full h-3 bg-surface-hover rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-feedback-error transition-all duration-500"
                style={{ width: `${overallUsagePercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-text-secondary font-mono">
              <span>Terpakai: {formatIDR(totalUsed)}</span>
              <span>Limit: {formatIDR(totalLimit)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Total Tagihan */}
            <div className="bg-surface-card border border-border rounded-2xl p-5">
              <p className="text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">Total Tagihan</p>
              <p className="text-2xl font-bold text-feedback-error mt-2 font-mono">{formatIDR(totalUsed)}</p>
              <p className="text-[10px] text-text-secondary mt-1">Akumulasi penggunaan limit</p>
            </div>

            {/* Sisa Kredit Tersedia */}
            <div className="bg-surface-card border border-border rounded-2xl p-5">
              <p className="text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">Sisa Kredit Tersedia</p>
              <p className="text-2xl font-bold text-text-success mt-2 font-mono">{formatIDR(totalAvailable)}</p>
              <p className="text-[10px] text-text-secondary mt-1">Limit yang masih bisa digunakan</p>
            </div>

            {/* Total Batas Limit */}
            <div className="bg-surface-card border border-border rounded-2xl p-5">
              <p className="text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">Total Batas Limit</p>
              <p className="text-2xl font-bold text-text-primary mt-2 font-mono">{formatIDR(totalLimit)}</p>
              <p className="text-[10px] text-text-secondary mt-1">Gabungan dari seluruh platform</p>
            </div>
          </div>
        </>
      )}

      {/* Grid List */}
      {loadingPaylaterPlatforms ? (
        <PaylaterGridSkeleton />
      ) : activePlatforms.length === 0 ? (
        <div className="bg-surface-card border border-border border-dashed rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-4 max-w-xl mx-auto mt-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-surface-hover text-text-secondary/40">
            <FolderMinus className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-text-primary">
              Belum ada platform Paylater
            </h3>
            <p className="text-xs text-text-secondary max-w-xs mx-auto leading-relaxed">
              Tambahkan platform Paylater (seperti GoPay Later, Shopee PayLater) untuk mulai mencatat dan memantau limit kredit Anda secara teratur.
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingPlatform(null);
              setIsPaylaterModalOpen(true);
            }}
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Tambah Platform Pertama
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activePlatforms.map((platform) => {
            const IconComponent = getIconComponent(platform.icon);
            const remainingLimit = platform.limit_amount - platform.balance;
            const usagePercentage = platform.limit_amount > 0
              ? Math.min((platform.balance / platform.limit_amount) * 100, 100)
              : 0;

            return (
              <div
                key={platform.id}
                className="bg-surface-card border border-border hover:border-border-strong rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:shadow transition-all group relative overflow-hidden animate-fade-in"
              >
                {/* Accent Line */}
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: platform.color }}
                />

                <div className="flex items-start justify-between gap-3 relative z-10">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                      style={{ backgroundColor: platform.color }}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text-primary">
                        {platform.name}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-text-secondary mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-text-muted" />
                        <span>
                          Siklus: Tgl {platform.billing_cycle_date} (Jatuh Tempo +{platform.due_date_offset} hari)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <ActionButton
                      icon={Edit2}
                      size="sm"
                      title="Edit Platform"
                      onClick={() => {
                        setEditingPlatform(platform);
                        setIsPaylaterModalOpen(true);
                      }}
                    />
                    <ActionButton
                      icon={Trash2}
                      size="sm"
                      title="Hapus Platform"
                      variant="danger"
                      onClick={() => setPlatformToDelete(platform)}
                    />
                  </div>
                </div>

                {/* Progress & Limit details */}
                <div className="mt-5 space-y-2.5">
                  <div className="flex justify-between items-end text-xs">
                    <div className="space-y-0.5">
                      <div className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Digunakan / Total Limit</div>
                      <div className="font-bold text-text-primary flex items-center gap-1.5">
                        <span className="text-feedback-error">{formatIDR(platform.balance)}</span>
                        <span className="text-text-muted">/</span>
                        <span className="text-text-secondary">{formatIDR(platform.limit_amount)}</span>
                      </div>
                    </div>
                    <div className="text-right space-y-0.5">
                      <div className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Sisa Limit</div>
                      <div className="font-bold text-text-success">
                        {formatIDR(remainingLimit)}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-surface-hover rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${usagePercentage}%`,
                        backgroundColor: platform.balance > platform.limit_amount ? "#EF4444" : platform.color
                      }}
                    />
                  </div>
                </div>

                {/* Footer Action button */}
                <div className="mt-2 pt-2 border-t border-border/60 flex justify-end">
                  <Link
                    href={`/paylater/${platform.id}`}
                    className="text-[10px] font-semibold text-primary hover:underline uppercase flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Lihat Detail
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Paylater Platform Modal (Add / Edit) */}
      <PaylaterModal
        isOpen={isPaylaterModalOpen}
        onClose={() => {
          setIsPaylaterModalOpen(false);
          setEditingPlatform(null);
        }}
        editingPlatform={editingPlatform}
        onSaveSuccess={handleRefreshAll}
      />

      {/* Paylater Platform Delete Modal */}
      <DeletePaylaterModal
        isOpen={platformToDelete !== null}
        onClose={() => setPlatformToDelete(null)}
        platformToDelete={platformToDelete}
        onDeleteSuccess={handleRefreshAll}
      />
    </div>
  );
}

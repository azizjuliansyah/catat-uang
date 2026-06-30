"use client";

import Link from "next/link";
import { User, ArrowLeft } from "lucide-react";
import { useUserDetailState } from "./hooks";
import { UserDetailCard } from "../components/UserDetailCard";
import { UserAuditLogs } from "../components/UserAuditLogs";
import { UserModals } from "../components/UserModals";
import { CardSkeleton } from "@/components/ui/molecules";
import { ModalUserCompat } from "./types";

export default function UserDetailPage() {
  const {
    user,
    auditLogs,
    loading,
    loadingLogs,
    currentPage,
    totalPages,
    total,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    suspendModalOpen,
    setSuspendModalOpen,
    deleteModalOpen,
    setDeleteModalOpen,
    resetPasswordModalOpen,
    setResetPasswordModalOpen,
    actionLoading,
    generatedPassword,
    handleToggleSuspend,
    handleResetPassword,
    handleDeleteUser,
  } = useUserDetailState();

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <CardSkeleton showIcon={false} showMetric={false} showActions={false} lines={4} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 font-sans">
        <User className="w-12 h-12 text-text-secondary mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-text-primary">Pengguna tidak ditemukan</h3>
        <p className="text-sm text-text-secondary mt-1">Pengguna yang Anda cari mungkin telah dihapus.</p>
        <Link
          href="/admin/users"
          className="inline-block mt-4 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-medium cursor-pointer"
        >
          Kembali ke Daftar
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Back Button */}
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Daftar
      </Link>

      {/* User Info Card */}
      <UserDetailCard
        user={user}
        setSuspendModalOpen={setSuspendModalOpen}
        setResetPasswordModalOpen={setResetPasswordModalOpen}
        setDeleteModalOpen={setDeleteModalOpen}
      />

      {/* Generated Password Display */}
      {generatedPassword && (
        <div className="bg-success/5 border border-success/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-success">Password Baru Telah Dibuat</p>
              <p className="text-xs text-text-secondary mt-0.5">Password ini hanya ditampilkan sekali. Harap segera dicatat.</p>
            </div>
            <div className="bg-surface-card px-4 py-2 rounded-lg border border-border">
              <code className="text-sm font-mono text-success">{generatedPassword}</code>
            </div>
          </div>
        </div>
      )}

      {/* Audit Log Section */}
      <UserAuditLogs
        auditLogs={auditLogs}
        loadingLogs={loadingLogs}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
        total={total}
      />

      {/* Modals */}
      <UserModals
        suspendModalOpen={suspendModalOpen}
        setSuspendModalOpen={setSuspendModalOpen}
        deleteModalOpen={deleteModalOpen}
        setDeleteModalOpen={setDeleteModalOpen}
        resetPasswordModalOpen={resetPasswordModalOpen}
        setResetPasswordModalOpen={setResetPasswordModalOpen}
        selectedUser={user as unknown as ModalUserCompat}
        actionLoading={actionLoading}
        handleToggleSuspend={handleToggleSuspend}
        handleDeleteUser={handleDeleteUser}
        handleResetPassword={handleResetPassword}
      />
    </div>
  );
}

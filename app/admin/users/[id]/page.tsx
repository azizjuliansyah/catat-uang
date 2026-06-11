"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getUserDetails, getUserAuditLogs, toggleSuspendUser, deleteUser, resetPassword } from "@/app/admin/actions";
import { ArrowLeft, User, Check, AlertCircle } from "lucide-react";
import { UserDetailCard } from "../components/UserDetailCard";
import { UserAuditLogs } from "../components/UserAuditLogs";
import { UserModals } from "../components/UserModals";

interface UserDetails {
  id: string;
  email: string;
  name: string | null;
  role: "admin" | "user";
  status: "active" | "suspended";
  created_at: string;
  updated_at: string;
}

interface AuditLog {
  id: string;
  actor_id: string;
  action: string;
  details: Record<string, unknown>;
  created_at: string;
  users?: {
    email: string;
  } | null;
}

// Minimal structure matching UserModals expected type
interface ModalUserCompat {
  id: string;
  email: string;
  name: string | null;
  role: "admin" | "user";
  status: "active" | "suspended";
  created_at: string;
}

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<UserDetails | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal states
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchUserDetails(), fetchUserAuditLogs()]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const showToast = (message: string, isSuccess = true) => {
    if (isSuccess) {
      setSuccessMsg(message);
      setTimeout(() => setSuccessMsg(null), 3000);
    } else {
      setErrorMsg(message);
      setTimeout(() => setErrorMsg(null), 4000);
    }
  };

  async function fetchUserDetails() {
    try {
      setLoading(true);
      const data = await getUserDetails(userId);
      setUser(data as UserDetails);
    } catch (err: unknown) {
      console.error("Error fetching user:", err);
      setErrorMsg("Gagal memuat detail pengguna");
    } finally {
      setLoading(false);
    }
  }

  async function fetchUserAuditLogs() {
    try {
      setLoadingLogs(true);
      const data = await getUserAuditLogs(userId);
      setAuditLogs(data as AuditLog[]);
    } catch (err: unknown) {
      console.error("Error fetching audit logs:", err);
    } finally {
      setLoadingLogs(false);
    }
  }

  const handleToggleSuspend = async () => {
    if (!user) return;

    try {
      setActionLoading(true);
      const newStatus = await toggleSuspendUser(user.id, user.status, user.email);

      showToast(
        newStatus === "suspended"
          ? "Pengguna berhasil ditangguhkan"
          : "Pengguna berhasil diaktifkan kembali"
      );

      setSuspendModalOpen(false);
      await Promise.all([fetchUserDetails(), fetchUserAuditLogs()]);
    } catch (err: unknown) {
      console.error("Error toggling suspend:", err);
      showToast("Gagal mengubah status pengguna", false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user) return;

    try {
      setActionLoading(true);
      const tempPassword = await resetPassword(user.id, user.email);

      setGeneratedPassword(tempPassword);
      showToast("Password berhasil di-reset");
      setResetPasswordModalOpen(false);
      await fetchUserAuditLogs();
    } catch (err: unknown) {
      console.error("Error resetting password:", err);
      showToast("Gagal mereset password", false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!user) return;

    try {
      setActionLoading(true);
      await deleteUser(user.id, user.email);

      showToast("Pengguna berhasil dihapus");
      setTimeout(() => router.push("/admin/users"), 1500);
    } catch (err: unknown) {
      console.error("Error deleting user:", err);
      showToast("Gagal menghapus pengguna", false);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-surface-card rounded-md animate-pulse" />
        <div className="h-64 bg-surface-card border border-border rounded-2xl animate-pulse" />
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
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      {/* Toast */}
      {successMsg && (
        <div className="fixed top-4 right-4 z-50 bg-success/15 border border-success/30 text-success px-4 py-3 rounded-xl flex items-center gap-2 shadow-lg">
          <Check className="w-4 h-4" />
          <span className="text-sm font-semibold">{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="fixed top-4 right-4 z-50 bg-danger/15 border border-danger/30 text-danger px-4 py-3 rounded-xl flex items-center gap-2 shadow-lg">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm font-semibold">{errorMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/users"
          className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-text-primary tracking-tight font-display">Detail Pengguna</h1>
          <p className="text-xs text-text-secondary mt-1">Informasi lengkap dan riwayat aksi pengguna.</p>
        </div>
      </div>

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
      <UserAuditLogs auditLogs={auditLogs} loadingLogs={loadingLogs} />

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

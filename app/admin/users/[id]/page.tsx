"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getUserDetails, getUserAuditLogs, toggleSuspendUser, deleteUser, resetPassword } from "@/app/admin/actions";
import {
  ArrowLeft,
  User,
  Shield,
  Calendar,
  Mail,
  UserCheck,
  UserX,
  RefreshCw,
  Trash2,
  FileText,
  Check,
  AlertCircle,
  PieChart
} from "lucide-react";

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
  details: Record<string, any>;
  created_at: string;
  users?: {
    email: string;
  } | null;
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
    } catch (err: any) {
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
    } catch (err: any) {
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
    } catch (err: any) {
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
    } catch (err: any) {
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
    } catch (err: any) {
      console.error("Error deleting user:", err);
      showToast("Gagal menghapus pengguna", false);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      create_user: "Membuat Pengguna",
      suspend_user: "Menangguhkan Pengguna",
      unsuspend_user: "Mengaktifkan Pengguna",
      delete_user: "Menghapus Pengguna",
      reset_password: "Reset Password"
    };
    return labels[action] || action;
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
      <div className="max-w-2xl mx-auto text-center py-12">
        <User className="w-12 h-12 text-text-secondary mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-text-primary">Pengguna tidak ditemukan</h3>
        <p className="text-sm text-text-secondary mt-1">Pengguna yang Anda cari mungkin telah dihapus.</p>
        <Link
          href="/admin/users"
          className="inline-block mt-4 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-medium"
        >
          Kembali ke Daftar
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
          className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Detail Pengguna</h1>
          <p className="text-sm text-text-secondary mt-0.5">Informasi lengkap dan riwayat aksi pengguna.</p>
        </div>
      </div>

      {/* User Info Card */}
      <div className="bg-surface-card border border-border rounded-2xl overflow-hidden">
        <div className={`h-2 ${
          user.status === "active" ? "bg-success" : "bg-danger"
        }`} />

        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold ${
                user.role === "admin" ? "bg-primary" : "bg-surface-input"
              }`}>
                {user.name?.[0] || user.email[0].toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-text-primary">{user.name || "Pengguna"}</h2>
                <p className="text-sm text-text-secondary flex items-center gap-1 mt-0.5">
                  <Mail className="w-3.5 h-3.5" />
                  {user.email}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                user.role === "admin"
                  ? "bg-primary/10 text-primary"
                  : "bg-surface-input text-text-secondary"
              }`}>
                <Shield className="w-4 h-4" />
                {user.role === "admin" ? "Administrator" : "User Biasa"}
              </span>

              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                user.status === "active"
                  ? "bg-success/10 text-success"
                  : "bg-danger/10 text-danger"
              }`}>
                {user.status === "active" ? (
                  <UserCheck className="w-4 h-4" />
                ) : (
                  <UserX className="w-4 h-4" />
                )}
                {user.status === "active" ? "Aktif" : "Ditangguhkan"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
            <div>
              <p className="text-xs text-text-secondary mb-1">Terdaftar Sejak</p>
              <p className="text-sm font-medium text-text-primary">
                {new Date(user.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric"
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-secondary mb-1">Terakhir Update</p>
              <p className="text-sm font-medium text-text-primary">
                {new Date(user.updated_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric"
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-secondary mb-1">ID Pengguna</p>
              <p className="text-sm font-mono text-text-secondary truncate">
                {user.id.slice(0, 8)}...
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-text-secondary mb-1">Aksi Tersedia</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setSuspendModalOpen(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    user.status === "active"
                      ? "text-warning hover:bg-warning/10"
                      : "text-success hover:bg-success/10"
                  }`}
                >
                  {user.status === "active" ? "Tangguhkan" : "Aktifkan"}
                </button>
                <button
                  onClick={() => setResetPasswordModalOpen(true)}
                  className="px-3 py-1.5 text-primary hover:bg-primary/10 rounded-lg text-xs font-medium transition-colors"
                >
                  Reset Password
                </button>
                <button
                  onClick={() => setDeleteModalOpen(true)}
                  className="px-3 py-1.5 text-danger hover:bg-danger/10 rounded-lg text-xs font-medium transition-colors"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

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
      <div className="bg-surface-card border border-border rounded-2xl">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <FileText className="w-4 h-4 text-text-secondary" />
          <h3 className="text-sm font-semibold text-text-primary">Riwayat Aksi (Audit Log)</h3>
          <span className="text-xs text-text-secondary">• 20 terakhir</span>
        </div>

        {loadingLogs ? (
          <div className="p-4 space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-surface-input rounded-lg animate-pulse" />
            ))}
          </div>
        ) : auditLogs.length === 0 ? (
          <div className="p-8 text-center text-text-secondary">
            <PieChart className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Belum ada riwayat aksi untuk pengguna ini</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 flex items-start gap-3 hover:bg-surface-hover transition-colors">
                <div className="w-8 h-8 rounded-full bg-surface-input flex items-center justify-center text-text-secondary shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">
                    {formatActionLabel(log.action)}
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5 flex items-center gap-2">
                    <span>oleh {log.users?.email || "Admin"}</span>
                    <span>•</span>
                    <span>{formatDate(log.created_at)}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Suspend Modal */}
      {suspendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface/80 backdrop-blur-sm">
          <div className="bg-surface-card border border-border rounded-2xl w-full max-w-sm p-6">
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-warning" />
              {user.status === "active" ? "Tangguhkan Pengguna?" : "Aktifkan Pengguna?"}
            </h2>
            <p className="text-xs text-text-secondary mt-2">
              {user.status === "active"
                ? "Pengguna tidak akan dapat mengakses aplikasi sampai diaktifkan kembali."
                : "Pengguna akan dapat mengakses aplikasi kembali."}
            </p>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setSuspendModalOpen(false)}
                className="flex-1 px-4 py-2 bg-surface-input hover:bg-surface-hover text-text-primary rounded-xl text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={handleToggleSuspend}
                disabled={actionLoading}
                className={`flex-1 px-4 py-2 text-white rounded-xl text-xs font-semibold disabled:opacity-50 ${
                  user.status === "active" ? "bg-warning" : "bg-success"
                }`}
              >
                {actionLoading ? "Memproses..." : user.status === "active" ? "Tangguhkan" : "Aktifkan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface/80 backdrop-blur-sm">
          <div className="bg-surface-card border border-border rounded-2xl w-full max-w-sm p-6">
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-primary" />
              Reset Password
            </h2>
            <p className="text-xs text-text-secondary mt-2">
              Password baru akan dibuat secara acak dan ditampilkan setelah proses selesai.
            </p>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setResetPasswordModalOpen(false)}
                className="flex-1 px-4 py-2 bg-surface-input hover:bg-surface-hover text-text-primary rounded-xl text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={handleResetPassword}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold disabled:opacity-50"
              >
                {actionLoading ? "Memproses..." : "Reset"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface/80 backdrop-blur-sm">
          <div className="bg-surface-card border border-border rounded-2xl w-full max-w-sm p-6">
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-danger" />
              Hapus Pengguna Permanen?
            </h2>
            <p className="text-xs text-text-secondary mt-2">
              Tindakan ini akan menghapus <strong>{user.email}</strong> beserta semua datanya secara permanen dan tidak dapat dibatalkan.
            </p>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 px-4 py-2 bg-surface-input hover:bg-surface-hover text-text-primary rounded-xl text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-danger text-white rounded-xl text-xs font-semibold disabled:opacity-50"
              >
                {actionLoading ? "Menghapus..." : "Hapus Permanen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

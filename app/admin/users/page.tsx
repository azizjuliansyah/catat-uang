"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUsers, toggleSuspendUser, deleteUser, resetPassword } from "@/app/admin/actions";
import {
  Plus,
  Search,
  UserCheck,
  UserX,
  RefreshCw,
  Trash2,
  Mail,
  Shield,
  Calendar,
  Check,
  X,
  AlertCircle,
  ChevronRight
} from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: "admin" | "user";
  status: "active" | "suspended";
  created_at: string;
}

export default function AdminUsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended">("all");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");

  // Modal states
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Messages
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const showToast = (message: string, isSuccess = true) => {
    if (isSuccess) {
      setSuccessMsg(message);
      setTimeout(() => setSuccessMsg(null), 3000);
    } else {
      setErrorMsg(message);
      setTimeout(() => setErrorMsg(null), 4000);
    }
  };

  async function fetchUsers() {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data as User[] || []);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      showToast("Gagal memuat data pengguna", false);
    } finally {
      setLoading(false);
    }
  }

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchTerm === "" ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  // Actions
  const handleToggleSuspend = async () => {
    if (!selectedUser) return;

    try {
      setActionLoading(true);
      const newStatus = await toggleSuspendUser(selectedUser.id, selectedUser.status, selectedUser.email);

      showToast(
        newStatus === "suspended"
          ? `Pengguna ${selectedUser.email} berhasil ditangguhkan`
          : `Pengguna ${selectedUser.email} berhasil diaktifkan kembali`
      );

      setSuspendModalOpen(false);
      setSelectedUser(null);
      await fetchUsers();
    } catch (err: any) {
      console.error("Error toggling suspend:", err);
      showToast("Gagal mengubah status pengguna: " + err.message, false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setActionLoading(true);

      await deleteUser(selectedUser.id, selectedUser.email);

      showToast(`Pengguna ${selectedUser.email} berhasil dihapus permanently`);
      setDeleteModalOpen(false);
      setSelectedUser(null);
      await fetchUsers();
    } catch (err: any) {
      console.error("Error deleting user:", err);
      showToast("Gagal menghapus pengguna: " + err.message, false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;

    try {
      setActionLoading(true);

      const tempPassword = await resetPassword(selectedUser.id, selectedUser.email);

      showToast(`Password reset berhasil untuk ${selectedUser.email}. Password baru: ${tempPassword}`);
      setResetPasswordModalOpen(false);
      setSelectedUser(null);
    } catch (err: any) {
      console.error("Error resetting password:", err);
      showToast("Gagal mereset password: " + err.message, false);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div className="space-y-6">
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Kelola Pengguna</h1>
          <p className="text-sm text-text-secondary mt-0.5">Kelola akun pengguna, status aktif/nonaktif, dan akses.</p>
        </div>

        <Link
          href="/admin/users/new"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-medium transition-colors hover:shadow-lg hover:shadow-primary/10 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Buat Pengguna
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari email atau nama..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface-input border border-border focus:border-primary focus:outline-none rounded-xl text-sm text-text-primary font-medium"
          />
        </div>

        {/* Status & Role Filters */}
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-surface-input border border-border focus:border-primary focus:outline-none rounded-xl text-sm text-text-primary font-medium"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="suspended">Ditangguhkan</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="px-3 py-2 bg-surface-input border border-border focus:border-primary focus:outline-none rounded-xl text-sm text-text-primary font-medium"
          >
            <option value="all">Semua Peran</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-surface-card border border-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-surface-input rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-surface-hover flex items-center justify-center text-text-secondary mx-auto mb-3">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-text-primary">Tidak ada pengguna ditemukan</h3>
            <p className="text-xs text-text-secondary mt-1">
              {searchTerm || statusFilter !== "all" || roleFilter !== "all"
                ? "Coba ubah filter pencarian Anda."
                : "Belum ada pengguna terdaftar."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-surface-input text-text-secondary uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 font-medium">Pengguna</th>
                  <th className="px-4 py-3 font-medium">Peran</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Terdaftar</th>
                  <th className="px-4 py-3 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-text-primary">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-hover transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{user.name || user.email.split("@")[0]}</p>
                        <p className="text-xs text-text-secondary">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        user.role === "admin"
                          ? "bg-primary/10 text-primary"
                          : "bg-surface-input text-text-secondary"
                      }`}>
                        <Shield className="w-3 h-3" />
                        {user.role === "admin" ? "Admin" : "User"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        user.status === "active"
                          ? "bg-success/10 text-success"
                          : "bg-danger/10 text-danger"
                      }`}>
                        {user.status === "active" ? (
                          <UserCheck className="w-3 h-3" />
                        ) : (
                          <UserX className="w-3 h-3" />
                        )}
                        {user.status === "active" ? "Aktif" : "Ditangguhkan"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-secondary">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setSuspendModalOpen(true);
                          }}
                          className={`p-1.5 rounded-lg transition-colors ${
                            user.status === "active"
                              ? "text-text-secondary hover:text-warning hover:bg-warning/10"
                              : "text-text-secondary hover:text-success hover:bg-success/10"
                          }`}
                          title={user.status === "active" ? "Tangguhkan" : "Aktifkan"}
                        >
                          {user.status === "active" ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>

                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setResetPasswordModalOpen(true);
                          }}
                          className="p-1.5 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="Reset Password"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setDeleteModalOpen(true);
                          }}
                          className="p-1.5 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                          title="Hapus Pengguna"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <Link
                          href={`/admin/users/${user.id}`}
                          className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors"
                          title="Detail"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Suspend/Unsuspend Modal */}
      {suspendModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface/80 backdrop-blur-sm">
          <div className="bg-surface-card border border-border rounded-2xl w-full max-w-sm p-6 relative">
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-warning shrink-0" />
              {selectedUser.status === "active" ? "Tangguhkan Pengguna?" : "Aktifkan Pengguna?"}
            </h2>
            <p className="text-xs text-text-secondary mt-2 leading-relaxed">
              {selectedUser.status === "active"
                ? `Pengguna ${selectedUser.email} tidak akan dapat mengakses aplikasi sampai diaktifkan kembali.`
                : `Pengguna ${selectedUser.email} akan dapat mengakses aplikasi kembali.`}
            </p>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  setSuspendModalOpen(false);
                  setSelectedUser(null);
                }}
                className="flex-1 px-4 py-2 bg-surface-input hover:bg-surface-hover border border-border text-text-primary rounded-xl text-xs font-semibold transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleToggleSuspend}
                disabled={actionLoading}
                className={`flex-1 px-4 py-2 text-white rounded-xl text-xs font-semibold transition-all disabled:opacity-50 ${
                  selectedUser.status === "active"
                    ? "bg-warning hover:bg-warning/90"
                    : "bg-success hover:bg-success/90"
                }`}
              >
                {actionLoading ? "Memproses..." : selectedUser.status === "active" ? "Tangguhkan" : "Aktifkan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {deleteModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface/80 backdrop-blur-sm">
          <div className="bg-surface-card border border-border rounded-2xl w-full max-w-sm p-6 relative">
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-danger shrink-0" />
              Hapus Pengguna?
            </h2>
            <p className="text-xs text-text-secondary mt-2 leading-relaxed">
              Anda yakin ingin menghapus <strong>{selectedUser.email}</strong>? Tindakan ini akan menghapus semua data pengguna secara <strong>permanent dan tidak dapat dibatalkan</strong>. Semua data keuangan akan hilang.
            </p>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setSelectedUser(null);
                }}
                className="flex-1 px-4 py-2 bg-surface-input hover:bg-surface-hover border border-border text-text-primary rounded-xl text-xs font-semibold transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-danger hover:bg-danger/90 text-white rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
              >
                {actionLoading ? "Menghapus..." : "Hapus Permanen"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetPasswordModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface/80 backdrop-blur-sm">
          <div className="bg-surface-card border border-border rounded-2xl w-full max-w-sm p-6 relative">
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-primary shrink-0" />
              Reset Password
            </h2>
            <p className="text-xs text-text-secondary mt-2 leading-relaxed">
              Password baru akan dibuat secara acak dan ditampilkan setelah proses berhasil. Password ini <strong>hanya ditampilkan sekali</strong>, harap segera dicatat.
            </p>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  setResetPasswordModalOpen(false);
                  setSelectedUser(null);
                }}
                className="flex-1 px-4 py-2 bg-surface-input hover:bg-surface-hover border border-border text-text-primary rounded-xl text-xs font-semibold transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleResetPassword}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
              >
                {actionLoading ? "Memproses..." : "Reset Password"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

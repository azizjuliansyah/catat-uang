"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getUsers, toggleSuspendUser, deleteUser, resetPassword } from "@/app/admin/actions/users";
import { Plus, Check, AlertCircle } from "lucide-react";
import { UserFilters } from "./components/UserFilters";
import { UserTable } from "./components/UserTable";
import { UserModals } from "./components/UserModals";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: "admin" | "user";
  status: "active" | "suspended";
  created_at: string;
}

export default function AdminUsersPage() {
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
    
    if (typeof window !== "undefined") {
      const email = sessionStorage.getItem("userCreatedSuccess");
      if (email) {
        showToast(`Pengguna dengan email ${email} berhasil dibuat!`);
        sessionStorage.removeItem("userCreatedSuccess");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setUsers((data as unknown as User[]) || []);
    } catch (err: unknown) {
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

  const handleActionClick = (user: User, actionType: "suspend" | "delete" | "reset") => {
    setSelectedUser(user);
    if (actionType === "suspend") setSuspendModalOpen(true);
    if (actionType === "delete") setDeleteModalOpen(true);
    if (actionType === "reset") setResetPasswordModalOpen(true);
  };

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
    } catch (err: unknown) {
      console.error("Error toggling suspend:", err);
      const msg = err instanceof Error ? err.message : String(err);
      showToast("Gagal mengubah status pengguna: " + msg, false);
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
    } catch (err: unknown) {
      console.error("Error deleting user:", err);
      const msg = err instanceof Error ? err.message : String(err);
      showToast("Gagal menghapus pengguna: " + msg, false);
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
    } catch (err: unknown) {
      console.error("Error resetting password:", err);
      const msg = err instanceof Error ? err.message : String(err);
      showToast("Gagal mereset password: " + msg, false);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
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
          <h1 className="text-2xl font-bold text-text-primary tracking-tight font-display">Kelola Pengguna</h1>
          <p className="text-xs text-text-secondary mt-1">Kelola akun pengguna, status aktif/nonaktif, dan akses.</p>
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
      <UserFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
      />

      {/* Users Table */}
      <div className="bg-surface-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <UserTable
          users={filteredUsers}
          loading={loading}
          onActionClick={handleActionClick}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          roleFilter={roleFilter}
        />
      </div>

      {/* Modals */}
      <UserModals
        suspendModalOpen={suspendModalOpen}
        setSuspendModalOpen={setSuspendModalOpen}
        deleteModalOpen={deleteModalOpen}
        setDeleteModalOpen={setDeleteModalOpen}
        resetPasswordModalOpen={resetPasswordModalOpen}
        setResetPasswordModalOpen={setResetPasswordModalOpen}
        selectedUser={selectedUser}
        actionLoading={actionLoading}
        handleToggleSuspend={handleToggleSuspend}
        handleDeleteUser={handleDeleteUser}
        handleResetPassword={handleResetPassword}
      />
    </div>
  );
}

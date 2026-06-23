"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useToast } from "@/components/ui/molecules/Toast";
import { getUserAuditLogs } from "@/app/admin/audit-log/actions";
import { getUserDetails, toggleSuspendUser, deleteUser, resetPassword } from "@/app/admin/users/actions";
import { UserDetails, AuditLog } from "../types";

export function useUserDetailState() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const { success, error } = useToast();

  const [user, setUser] = useState<UserDetails | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);

  // Modal states
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);

  const fetchUserDetails = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getUserDetails(userId);
      setUser(data as UserDetails);
    } catch (err: unknown) {
      console.error("Error fetching user:", err);
      error("Gagal memuat detail pengguna");
    } finally {
      setLoading(false);
    }
  }, [userId, error]);

  const fetchUserAuditLogs = useCallback(async () => {
    try {
      setLoadingLogs(true);
      const data = await getUserAuditLogs(userId);
      setAuditLogs(data as AuditLog[]);
    } catch (err: unknown) {
      console.error("Error fetching audit logs:", err);
    } finally {
      setLoadingLogs(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      Promise.all([fetchUserDetails(), fetchUserAuditLogs()]);
    }
  }, [userId, fetchUserDetails, fetchUserAuditLogs]);

  const handleToggleSuspend = async () => {
    if (!user) return;

    try {
      setActionLoading(true);
      const newStatus = await toggleSuspendUser(user.id, user.status, user.email);

      success(
        newStatus === "suspended"
          ? "Pengguna berhasil ditangguhkan"
          : "Pengguna berhasil diaktifkan kembali"
      );

      setSuspendModalOpen(false);
      await Promise.all([fetchUserDetails(), fetchUserAuditLogs()]);
    } catch (err: unknown) {
      console.error("Error toggling suspend:", err);
      error("Gagal mengubah status pengguna");
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
      success("Password berhasil di-reset");
      setResetPasswordModalOpen(false);
      await fetchUserAuditLogs();
    } catch (err: unknown) {
      console.error("Error resetting password:", err);
      error("Gagal mereset password");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!user) return;

    try {
      setActionLoading(true);
      await deleteUser(user.id, user.email);

      success("Pengguna berhasil dihapus");
      setTimeout(() => router.push("/admin/users"), 1500);
    } catch (err: unknown) {
      console.error("Error deleting user:", err);
      error("Gagal menghapus pengguna");
    } finally {
      setActionLoading(false);
    }
  };

  return {
    userId,
    user,
    auditLogs,
    loading,
    loadingLogs,
    suspendModalOpen,
    setSuspendModalOpen,
    deleteModalOpen,
    setDeleteModalOpen,
    resetPasswordModalOpen,
    setResetPasswordModalOpen,
    actionLoading,
    generatedPassword,
    setGeneratedPassword,
    handleToggleSuspend,
    handleResetPassword,
    handleDeleteUser,
  };
}

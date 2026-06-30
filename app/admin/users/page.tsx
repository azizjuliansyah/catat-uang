"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, Plus } from "lucide-react";
import { useToast } from "@/components/ui/molecules/Toast";
import { PageHeader } from "@/components/ui/molecules/PageHeader";
import { Button } from "@/components/ui/atoms/Button";
import { UserFilterBar, UserTable, UserModals } from "./components";
import { useUsersState, useUsersHandlers } from "./hooks";
import { AdminUsersPageSkeleton } from "./page.skeleton";

export default function AdminUsersPage() {
  const router = useRouter();
  const { success, error } = useToast();

  const {
    setUsers,
    setLoading,
    setActionLoading,
    filteredUsers,
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    roleFilter,
    setRoleFilter,
    suspendModalOpen,
    setSuspendModalOpen,
    deleteModalOpen,
    setDeleteModalOpen,
    resetPasswordModalOpen,
    setResetPasswordModalOpen,
    selectedUser,
    generatedPassword,
    setGeneratedPassword,
    actionLoading,
    handleActionClick,
    closeAllModals,
  } = useUsersState();

  const { fetchUsers, handleToggleSuspend, handleDeleteUser, handleResetPassword } = useUsersHandlers({
    setUsers,
    setLoading,
    setActionLoading,
    closeAllModals,
    setGeneratedPassword,
    success,
    error,
  });

  useEffect(() => {
    fetchUsers();

    if (typeof window !== "undefined") {
      const email = sessionStorage.getItem("userCreatedSuccess");
      if (email) {
        success(`Pengguna dengan email ${email} berhasil dibuat!`);
        sessionStorage.removeItem("userCreatedSuccess");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <PageHeader
        icon={Users}
        iconClassName="w-6 h-6 text-warning"
        title="Kelola Pengguna"
        description="Kelola akun pengguna, status aktif/nonaktif, dan akses."
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => router.push("/admin/users/new")}
            className="flex-1 sm:flex-initial"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Buat Pengguna
          </Button>
        }
      />

      {/* Filters */}
      <UserFilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
      />

      {/* Users Table */}
      {loading ? (
        <AdminUsersPageSkeleton />
      ) : (
        <div className="bg-surface-card border border-border rounded-2xl overflow-hidden">
          <UserTable
            users={filteredUsers}
            loading={loading}
            onActionClick={handleActionClick}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            roleFilter={roleFilter}
          />
        </div>
      )}

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
        generatedPassword={generatedPassword}
        handleToggleSuspend={() => handleToggleSuspend(selectedUser)}
        handleDeleteUser={() => handleDeleteUser(selectedUser)}
        handleResetPassword={(password) => handleResetPassword(selectedUser, password)}
      />
    </div>
  );
}

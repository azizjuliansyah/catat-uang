"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/molecules/Toast";
import { UserFilters } from "./components/UserFilters";
import { UserTable } from "./components/UserTable";
import { UserModals } from "./components/UserModals";
import { UsersHeader } from "./components/UsersHeader";
import { useUsersState } from "./hooks/useUsersState";
import { useUsersHandlers } from "./hooks/useUsersHandlers";

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
    actionLoading,
    handleActionClick,
    closeAllModals,
  } = useUsersState();

  const { fetchUsers, handleToggleSuspend, handleDeleteUser, handleResetPassword } = useUsersHandlers({
    setUsers,
    setLoading,
    setActionLoading,
    closeAllModals,
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
      <UsersHeader onCreateClick={() => router.push("/admin/users/new")} />

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
        handleToggleSuspend={() => handleToggleSuspend(selectedUser)}
        handleDeleteUser={() => handleDeleteUser(selectedUser)}
        handleResetPassword={() => handleResetPassword(selectedUser)}
      />
    </div>
  );
}

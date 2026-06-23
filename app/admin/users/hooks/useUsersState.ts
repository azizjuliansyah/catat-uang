import { useState } from "react";

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: "admin" | "user";
  status: "active" | "suspended";
  created_at: string;
  avatar_url?: string | null;
}

export function useUsersState() {
  // Data states
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended">("all");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");

  // Modal states
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Action loading state
  const [actionLoading, setActionLoading] = useState(false);

  // Filtered users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchTerm === "" ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  // Helper to open modals
  const handleActionClick = (user: User, actionType: "suspend" | "delete" | "reset") => {
    setSelectedUser(user);
    if (actionType === "suspend") setSuspendModalOpen(true);
    if (actionType === "delete") setDeleteModalOpen(true);
    if (actionType === "reset") setResetPasswordModalOpen(true);
  };

  // Helper to close all modals
  const closeAllModals = () => {
    setSuspendModalOpen(false);
    setDeleteModalOpen(false);
    setResetPasswordModalOpen(false);
    setSelectedUser(null);
  };

  return {
    // Data
    users,
    setUsers,
    loading,
    setLoading,

    // Filters
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    roleFilter,
    setRoleFilter,
    filteredUsers,

    // Modals
    suspendModalOpen,
    setSuspendModalOpen,
    deleteModalOpen,
    setDeleteModalOpen,
    resetPasswordModalOpen,
    setResetPasswordModalOpen,
    selectedUser,
    setSelectedUser,

    // Actions
    actionLoading,
    setActionLoading,
    handleActionClick,
    closeAllModals,
  };
}

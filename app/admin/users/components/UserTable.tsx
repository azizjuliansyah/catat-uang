"use client";

import { Mail, Shield, UserCheck, UserX } from "lucide-react";
import { EmptyState } from "@/components/ui/organisms/EmptyState";
import { Table } from "@/components/ui/organisms/Table";
import type { TableColumn } from "@/components/ui/molecules/TableHeader";
import { UserActionsCell } from "./UserActionsCell";
import type { User } from "../types";

interface UserTableProps {
  users: User[];
  loading: boolean;
  onActionClick: (user: User, actionType: "suspend" | "delete" | "reset") => void;
  searchTerm: string;
  statusFilter: string;
  roleFilter: string;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

export function UserTable({
  users,
  loading,
  onActionClick,
  searchTerm,
  statusFilter,
  roleFilter
}: UserTableProps) {
  if (!loading && users.length === 0) {
    return (
      <EmptyState
        icon={Mail}
        title="Tidak ada pengguna ditemukan"
        description={
          searchTerm || statusFilter !== "all" || roleFilter !== "all"
            ? "Coba ubah filter pencarian Anda."
            : "Belum ada pengguna terdaftar."
        }
      />
    );
  }

  const columns: TableColumn[] = [
    { id: "user", label: "Pengguna", align: "left", width: "30%" },
    { id: "role", label: "Peran", align: "left", width: "15%" },
    { id: "status", label: "Status", align: "left", width: "15%" },
    { id: "created", label: "Terdaftar", align: "left", width: "20%" },
    { id: "actions", label: "Aksi", align: "center", width: "20%" },
  ];

  return (
    <Table
      columns={columns}
      loading={loading}
      skeletonRowCount={5}
    >
      {users.map((user) => (
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
            <UserActionsCell user={user} onActionClick={onActionClick} />
          </td>
        </tr>
      ))}
    </Table>
  );
}

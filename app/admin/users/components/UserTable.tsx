"use client";

import Link from "next/link";
import { Button } from "@/components/ui/atoms/Button";
import {
  UserCheck,
  UserX,
  RefreshCw,
  Trash2,
  Mail,
  Shield,
  ChevronRight
} from "lucide-react";
import { UsersSkeleton } from "./UsersSkeleton";
import { EmptyState } from "@/components/ui/organisms/EmptyState";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: "admin" | "user";
  status: "active" | "suspended";
  created_at: string;
}

interface UserTableProps {
  users: User[];
  loading: boolean;
  onActionClick: (user: User, actionType: "suspend" | "delete" | "reset") => void;
  searchTerm: string;
  statusFilter: string;
  roleFilter: string;
}

export function UserTable({
  users,
  loading,
  onActionClick,
  searchTerm,
  statusFilter,
  roleFilter
}: UserTableProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  if (loading) {
    return <UsersSkeleton />;
  }

  if (users.length === 0) {
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

  return (
    <div className="overflow-x-auto font-sans">
      <table className="w-full text-sm text-left">
        <thead className="bg-surface-input text-text-secondary uppercase text-xs">
          <tr>
            <th className="px-4 py-3 font-medium">Pengguna</th>
            <th className="px-4 py-3 font-medium">Peran</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Terdaftar</th>
            <th className="px-4 py-3 font-medium text-center">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border text-text-primary">
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
                <div className="flex items-center justify-center gap-1">
                  <Button
                    variant="ghost"
                    onClick={() => onActionClick(user, "suspend")}
                    className={`p-1.5 min-h-0 h-auto rounded-lg transition-colors ${
                      user.status === "active"
                        ? "text-text-secondary hover:text-warning hover:bg-warning/10"
                        : "text-text-secondary hover:text-success hover:bg-success/10"
                    }`}
                    title={user.status === "active" ? "Tangguhkan" : "Aktifkan"}
                  >
                    {user.status === "active" ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => onActionClick(user, "reset")}
                    className="p-1.5 min-h-0 h-auto text-text-secondary hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    title="Reset Password"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => onActionClick(user, "delete")}
                    className="p-1.5 min-h-0 h-auto text-text-secondary hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                    title="Hapus Pengguna"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>

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
  );
}

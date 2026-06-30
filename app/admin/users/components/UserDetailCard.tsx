"use client";

import { Mail, Shield, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/atoms/Button";
import { UserDetails } from "../[id]/types";

// Helper to get initials from name
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

interface UserDetailCardProps {
  user: UserDetails;
  setSuspendModalOpen: (val: boolean) => void;
  setResetPasswordModalOpen: (val: boolean) => void;
  setDeleteModalOpen: (val: boolean) => void;
}

export function UserDetailCard({
  user,
  setSuspendModalOpen,
  setResetPasswordModalOpen,
  setDeleteModalOpen
}: UserDetailCardProps) {
  return (
    <div className="bg-surface-card border border-border rounded-2xl overflow-hidden font-sans">
      <div className={`h-2 ${user.status === "active" ? "bg-success" : "bg-danger"}`} />

      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Avatar - shows photo if available, otherwise shows gradient with initials */}
            <div className="shrink-0">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name || "User"}
                  className="w-24 h-24 rounded-full object-cover border-4 border-surface"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center border-4 border-surface">
                  <span className="text-3xl font-bold text-white font-display">
                    {getInitials(user.name || user.email || "Pengguna")}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary">{user.name || "Pengguna"}</h2>
              <p className="text-sm text-text-secondary flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5" />
                {user.email}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
              user.role === "admin"
                ? "bg-primary/10 text-primary"
                : "bg-surface-input text-text-secondary"
            }`}>
              <Shield className="w-4 h-4" />
              {user.role === "admin" ? "Administrator" : "User Biasa"}
            </span>

            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
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
          <div className="col-span-2">
            <p className="text-xs text-text-secondary mb-1">ID Pengguna</p>
            <p className="text-sm font-mono text-text-secondary break-all">
              {user.id}
            </p>
          </div>
          <div className="col-span-2 md:col-span-2">
            <p className="text-xs text-text-secondary mb-1">Aksi Tersedia</p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={user.status === "active" ? "warning" : "success"}
                size="sm"
                onClick={() => setSuspendModalOpen(true)}
                className="px-3 py-1.5 min-h-0 h-auto rounded-lg text-xs font-medium"
              >
                {user.status === "active" ? "Tangguhkan" : "Aktifkan"}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setResetPasswordModalOpen(true)}
                className="px-3 py-1.5 min-h-0 h-auto rounded-lg text-xs font-medium"
              >
                Reset Password
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteModalOpen(true)}
                className="px-3 py-1.5 min-h-0 h-auto rounded-lg text-xs font-medium"
              >
                Hapus
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

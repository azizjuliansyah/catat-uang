"use client";

import { Mail, Shield, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/atoms/Button";
import { UserDetails } from "../[id]/types";

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
            {/* Avatar - shows photo if available, otherwise shows initial */}
            <div className="shrink-0 w-24 h-24 rounded-full overflow-hidden border border-border bg-surface-input flex items-center justify-center">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.name || "User"} className="w-full h-full object-cover" />
              ) : (
                <span className="text-text-secondary text-2xl font-bold font-mono truncate">
                  {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "?"}
                </span>
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
          <div>
            <p className="text-xs text-text-secondary mb-1">ID Pengguna</p>
            <p className="text-sm font-mono text-text-secondary truncate">
              {user.id.slice(0, 8)}...
            </p>
          </div>
          <div className="col-span-2 md:col-span-1">
            <p className="text-xs text-text-secondary mb-1">Aksi Tersedia</p>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSuspendModalOpen(true)}
                className={`px-3 py-1.5 min-h-0 h-auto rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  user.status === "active"
                    ? "text-warning hover:bg-warning/10 hover:text-warning"
                    : "text-success hover:bg-success/10 hover:text-success"
                }`}
              >
                {user.status === "active" ? "Tangguhkan" : "Aktifkan"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setResetPasswordModalOpen(true)}
                className="px-3 py-1.5 min-h-0 h-auto text-primary hover:bg-primary/10 hover:text-primary rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                Reset
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteModalOpen(true)}
                className="px-3 py-1.5 min-h-0 h-auto"
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

"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/atoms/Button";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: "admin" | "user";
  status: "active" | "suspended";
  created_at: string;
}

interface UserModalsProps {
  suspendModalOpen: boolean;
  setSuspendModalOpen: (val: boolean) => void;
  deleteModalOpen: boolean;
  setDeleteModalOpen: (val: boolean) => void;
  resetPasswordModalOpen: boolean;
  setResetPasswordModalOpen: (val: boolean) => void;
  selectedUser: User | null;
  actionLoading: boolean;
  handleToggleSuspend: () => Promise<void>;
  handleDeleteUser: () => Promise<void>;
  handleResetPassword: () => Promise<void>;
}

export function UserModals({
  suspendModalOpen,
  setSuspendModalOpen,
  deleteModalOpen,
  setDeleteModalOpen,
  resetPasswordModalOpen,
  setResetPasswordModalOpen,
  selectedUser,
  actionLoading,
  handleToggleSuspend,
  handleDeleteUser,
  handleResetPassword
}: UserModalsProps) {
  if (!selectedUser) return null;

  return (
    <div className="font-sans">
      {/* Suspend/Unsuspend Modal */}
      {suspendModalOpen && (
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
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSuspendModalOpen(false)}
                className="flex-1 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Batal
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleSuspend}
                disabled={actionLoading}
                isLoading={actionLoading}
                className={`flex-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedUser.status === "active"
                    ? "bg-warning hover:bg-warning/90 text-zinc-950 hover:text-zinc-900 border border-transparent"
                    : "bg-success hover:bg-success/90 text-white border border-transparent"
                }`}
              >
                {selectedUser.status === "active" ? "Tangguhkan" : "Aktifkan"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {deleteModalOpen && (
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
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteUser}
                disabled={actionLoading}
                isLoading={actionLoading}
                className="flex-1 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Hapus Permanen
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetPasswordModalOpen && (
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
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setResetPasswordModalOpen(false)}
                className="flex-1 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Batal
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleResetPassword}
                disabled={actionLoading}
                isLoading={actionLoading}
                className="flex-1 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Reset Password
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

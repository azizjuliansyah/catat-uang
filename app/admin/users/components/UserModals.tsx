"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Modal } from "@/components/ui/organisms/Modal";
import { ModalFooter } from "@/components/ui/molecules/ModalFooter";
import { ModalUserCompat } from "../[id]/types";

interface UserModalsProps {
  suspendModalOpen: boolean;
  setSuspendModalOpen: (val: boolean) => void;
  deleteModalOpen: boolean;
  setDeleteModalOpen: (val: boolean) => void;
  resetPasswordModalOpen: boolean;
  setResetPasswordModalOpen: (val: boolean) => void;
  selectedUser: ModalUserCompat | null;
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

  const isSuspendAction = selectedUser.status === "active";

  return (
    <>
      {/* Suspend/Unsuspend Modal */}
      <Modal
        isOpen={suspendModalOpen}
        onClose={() => setSuspendModalOpen(false)}
        title={
          <div className="flex items-center gap-2">
            <AlertCircle className={`w-5 h-5 shrink-0 ${isSuspendAction ? "text-warning" : "text-success"}`} />
            <span>{isSuspendAction ? "Tangguhkan Pengguna?" : "Aktifkan Pengguna?"}</span>
          </div>
        }
        footer={
          <ModalFooter
            onCancel={() => setSuspendModalOpen(false)}
            onSubmit={handleToggleSuspend}
            isSubmitting={actionLoading}
            disabled={actionLoading}
            cancelVariant="secondary"
            submitText={isSuspendAction ? "Tangguhkan" : "Aktifkan"}
            submitVariant="success"
            className={isSuspendAction ? "!bg-warning hover:!bg-warning/90 !border-warning !text-zinc-950" : ""}
          />
        }
      >
        <p className="text-sm text-text-secondary leading-relaxed">
          {isSuspendAction
            ? `Pengguna ${selectedUser.email} tidak akan dapat mengakses aplikasi sampai diaktifkan kembali.`
            : `Pengguna ${selectedUser.email} akan dapat mengakses aplikasi kembali.`}
        </p>
      </Modal>

      {/* Delete User Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title={
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-danger shrink-0" />
            <span>Hapus Pengguna?</span>
          </div>
        }
        isDestructive
        footer={
          <ModalFooter
            onCancel={() => setDeleteModalOpen(false)}
            onSubmit={handleDeleteUser}
            isSubmitting={actionLoading}
            disabled={actionLoading}
            cancelVariant="secondary"
            submitText="Hapus Permanen"
            variant="destructive"
          />
        }
      >
        <p className="text-sm text-text-secondary leading-relaxed">
          Anda yakin ingin menghapus <strong>{selectedUser.email}</strong>? Tindakan ini akan menghapus semua data pengguna secara <strong>permanent dan tidak dapat dibatalkan</strong>. Semua data keuangan akan hilang.
        </p>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={resetPasswordModalOpen}
        onClose={() => setResetPasswordModalOpen(false)}
        title={
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-primary shrink-0" />
            <span>Reset Password</span>
          </div>
        }
        footer={
          <ModalFooter
            onCancel={() => setResetPasswordModalOpen(false)}
            onSubmit={handleResetPassword}
            isSubmitting={actionLoading}
            disabled={actionLoading}
            cancelVariant="secondary"
            submitText="Reset Password"
          />
        }
      >
        <p className="text-sm text-text-secondary leading-relaxed">
          Password baru akan dibuat secara acak dan ditampilkan setelah proses berhasil. Password ini <strong>hanya ditampilkan sekali</strong>, harap segera dicatat.
        </p>
      </Modal>
    </>
  );
}

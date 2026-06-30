"use client";

import { useState } from "react";
import { AlertCircle, RefreshCw, Copy, Check } from "lucide-react";
import { Modal } from "@/components/ui/organisms/Modal";
import { ModalFooter } from "@/components/ui/molecules/ModalFooter";
import { Button } from "@/components/ui/atoms/Button";
import { PasswordInput } from "@/components/ui/atoms/PasswordInput";
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
  handleResetPassword: (password?: string) => Promise<void>;
  generatedPassword?: string;
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
  handleResetPassword,
  generatedPassword,
}: UserModalsProps) {
  const [resetPassword, setResetPassword] = useState("");
  const [copied, setCopied] = useState(false);

  if (!selectedUser) return null;

  const isSuspendAction = selectedUser.status === "active";

  const generateRandomPassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setResetPassword(password);
  };

  const handleResetPasswordSubmit = async () => {
    if (!resetPassword.trim()) {
      return;
    }
    await handleResetPassword(resetPassword);
    setResetPassword("");
  };

  const handleCopyToClipboard = async () => {
    if (generatedPassword) {
      try {
        await navigator.clipboard.writeText(generatedPassword);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  };

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
            submitVariant={isSuspendAction ? "warning" : "success"}
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
        title="Hapus Pengguna?"
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
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-md bg-danger/10 text-danger flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="flex-1 text-sm text-text-secondary leading-relaxed">
            Anda yakin ingin menghapus <strong>{selectedUser.email}</strong>? Tindakan ini akan menghapus semua data pengguna secara <strong>permanent dan tidak dapat dibatalkan</strong>. Semua data keuangan akan hilang.
          </div>
        </div>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={resetPasswordModalOpen}
        onClose={() => {
          setResetPasswordModalOpen(false);
          setResetPassword("");
          setCopied(false);
        }}
        title={
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-primary shrink-0" />
            <span>Reset Password</span>
          </div>
        }
        footer={
          generatedPassword ? (
            <div className="flex justify-end pt-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setResetPasswordModalOpen(false);
                  setResetPassword("");
                  setCopied(false);
                }}
              >
                Tutup
              </Button>
            </div>
          ) : (
            <ModalFooter
              onCancel={() => {
                setResetPasswordModalOpen(false);
                setResetPassword("");
              }}
              onSubmit={handleResetPasswordSubmit}
              isSubmitting={actionLoading}
              disabled={actionLoading || !resetPassword.trim()}
              cancelVariant="secondary"
              submitText="Reset Password"
            />
          )
        }
      >
        {generatedPassword ? (
          <div className="bg-success/5 border border-success/20 rounded-xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-sm font-semibold text-success mb-1">Password Baru Telah Dibuat</p>
                <p className="text-xs text-text-secondary">Password ini hanya ditampilkan sekali. Harap segera dicatat atau disalin.</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyToClipboard}
                className="flex-shrink-0 bg-success/10 text-success hover:bg-success/20 px-3 py-1.5 rounded-lg min-h-0 h-auto"
                title="Salin ke clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-1.5" />
                    Tersalin
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1.5" />
                    Salin
                  </>
                )}
              </Button>
            </div>
            <div className="bg-surface-card px-4 py-2 rounded-lg border border-border mt-3">
              <code className="text-md font-mono text-success">{generatedPassword}</code>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-text-secondary leading-relaxed">
              Masukkan password baru untuk pengguna <strong>{selectedUser.email}</strong>.
            </p>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-text-secondary mb-1.5">
                Password Baru <span className="text-danger">*</span>
              </label>
              <PasswordInput
                placeholder="Minimal 8 karakter"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                disabled={actionLoading}
                rightElement={
                  <Button
                    variant="ghost"
                    onClick={generateRandomPassword}
                    disabled={actionLoading}
                    className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-lg hover:bg-primary/20 transition-colors min-h-0 h-auto"
                    title="Generate random password"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Generate
                  </Button>
                }
              />
              <p className="text-xs text-text-secondary mt-1">
                Minimal 8 karakter. Gunakan tombol Generate untuk password acak yang aman (16 karakter dengan simbol).
              </p>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

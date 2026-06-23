"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useApp } from "@/app/providers/AppProvider";
import { useToast } from "@/components/ui/molecules/Toast";
import { Button } from "@/components/ui/atoms/Button";
import { Lock, Eye, EyeOff, Check, AlertCircle } from "lucide-react";

export function SecurityTab() {
  const supabase = createClient();
  const { user } = useApp();
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<{
    current?: string;
    new?: string;
    confirm?: string;
  }>({});

  function getErrorMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    return String(err);
  }

  // Validate Password
  function validatePassword(password: string): { valid: boolean; error?: string } {
    if (password.length < 8) {
      return { valid: false, error: "Password minimal 8 karakter" };
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, error: "Password harus mengandung minimal 1 huruf kapital" };
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, error: "Password harus mengandung minimal 1 huruf kecil" };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, error: "Password harus mengandung minimal 1 angka" };
    }
    return { valid: true };
  }

  // Handle Password Change
  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPasswordErrors({});

    // Validate current password
    if (!currentPassword) {
      setPasswordErrors({ current: "Password saat ini wajib diisi" });
      return;
    }

    // Validate new password
    const newPasswordValidation = validatePassword(newPassword);
    if (!newPasswordValidation.valid) {
      setPasswordErrors({ new: newPasswordValidation.error });
      return;
    }

    // Validate confirm password
    if (newPassword !== confirmPassword) {
      setPasswordErrors({ confirm: "Konfirmasi password tidak cocok" });
      return;
    }

    if (newPassword === currentPassword) {
      setPasswordErrors({ new: "Password baru tidak boleh sama dengan password saat ini" });
      return;
    }

    setPasswordSaving(true);
    try {
      // First verify current password by signing in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: currentPassword,
      });

      if (signInError) {
        setPasswordErrors({ current: "Password saat ini salah" });
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      showSuccessToast("Password berhasil diperbarui!");

      // Reset form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordErrors({});
    } catch (err: unknown) {
      console.error("Error updating password:", err);
      showErrorToast("Gagal memperbarui password: " + getErrorMessage(err));
    } finally {
      setPasswordSaving(false);
    }
  }

  return (
    <div className="bg-surface-card border border-border rounded-2xl p-6 space-y-6">
      <h2 className="text-base font-bold text-text-primary font-display border-b border-border/40 pb-3 flex items-center gap-2">
        <Lock className="w-5 h-5 text-primary" />
        Keamanan & Password
      </h2>

      <form onSubmit={handlePasswordChange} className="space-y-5">
        {/* Current Password */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
            Password Saat Ini
            <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <input
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                setPasswordErrors((prev) => ({ ...prev, current: undefined }));
              }}
              placeholder="Masukkan password saat ini"
              className={`w-full px-3.5 py-2.5 pr-10 bg-surface-input border rounded-xl text-xs text-text-primary outline-none transition-all focus-glow ${
                passwordErrors.current
                  ? "border-danger focus:border-danger focus:ring-1 focus:ring-danger"
                  : "border-border focus:border-primary focus:ring-1 focus:ring-primary"
              }`}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-1 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors cursor-pointer min-h-0 h-8 w-8 p-0 bg-transparent border-transparent hover:bg-transparent"
            >
              {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
          {passwordErrors.current && (
            <p className="text-xs text-danger font-medium flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              {passwordErrors.current}
            </p>
          )}
        </div>

        {/* New Password */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
            Password Baru
            <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setPasswordErrors((prev) => ({ ...prev, new: undefined }));
              }}
              placeholder="Masukkan password baru"
              className={`w-full px-3.5 py-2.5 pr-10 bg-surface-input border rounded-xl text-xs text-text-primary outline-none transition-all focus-glow ${
                passwordErrors.new
                  ? "border-danger focus:border-danger focus:ring-1 focus:ring-danger"
                  : "border-border focus:border-primary focus:ring-1 focus:ring-primary"
              }`}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-1 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors cursor-pointer min-h-0 h-8 w-8 p-0 bg-transparent border-transparent hover:bg-transparent"
            >
              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
          {passwordErrors.new && (
            <p className="text-xs text-danger font-medium flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              {passwordErrors.new}
            </p>
          )}
        </div>

        {/* Password Requirements */}
        <div className="bg-surface/50 rounded-xl p-3 space-y-1.5">
          <p className="text-xs font-semibold text-text-secondary">Password harus mengandung:</p>
          <ul className="text-[10px] text-text-muted space-y-1 ml-4">
            <li className={newPassword.length >= 8 ? "text-success flex items-center gap-1" : "flex items-center gap-1"}>
              <Check className="w-3.5 h-3.5" />
              Minimal 8 karakter
            </li>
            <li className={/[A-Z]/.test(newPassword) ? "text-success flex items-center gap-1" : "flex items-center gap-1"}>
              <Check className="w-3.5 h-3.5" />
              Minimal 1 huruf kapital (A-Z)
            </li>
            <li className={/[a-z]/.test(newPassword) ? "text-success flex items-center gap-1" : "flex items-center gap-1"}>
              <Check className="w-3.5 h-3.5" />
              Minimal 1 huruf kecil (a-z)
            </li>
            <li className={/[0-9]/.test(newPassword) ? "text-success flex items-center gap-1" : "flex items-center gap-1"}>
              <Check className="w-3.5 h-3.5" />
              Minimal 1 angka (0-9)
            </li>
          </ul>
        </div>

        {/* Confirm New Password */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
            Konfirmasi Password Baru
            <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setPasswordErrors((prev) => ({ ...prev, confirm: undefined }));
              }}
              placeholder="Masukkan ulang password baru"
              className={`w-full px-3.5 py-2.5 pr-10 bg-surface-input border rounded-xl text-xs text-text-primary outline-none transition-all focus-glow ${
                passwordErrors.confirm
                  ? "border-danger focus:border-danger focus:ring-1 focus:ring-danger"
                  : "border-border focus:border-primary focus:ring-1 focus:ring-primary"
              }`}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-1 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors cursor-pointer min-h-0 h-8 w-8 p-0 bg-transparent border-transparent hover:bg-transparent"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
          {passwordErrors.confirm && (
            <p className="text-xs text-danger font-medium flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              {passwordErrors.confirm}
            </p>
          )}
          {confirmPassword && newPassword === confirmPassword && !passwordErrors.confirm && (
            <p className="text-xs text-success font-medium flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              Password cocok
            </p>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-border/40">
          <Button
            type="submit"
            variant="primary"
            isLoading={passwordSaving}
            className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider"
            disabled={!currentPassword || !newPassword || !confirmPassword}
          >
            Update Password
          </Button>
        </div>
      </form>
    </div>
  );
}

/**
 * Password validation utilities and state management
 */

import { useState, useCallback } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { useToast } from "@/components/ui/molecules/Toast";

interface PasswordErrors {
  current?: string;
  new?: string;
  confirm?: string;
}

interface UsePasswordValidationParams {
  user: any;
  supabase: SupabaseClient;
}

interface UsePasswordValidationReturn {
  // State
  currentPassword: string;
  setCurrentPassword: (value: string) => void;
  newPassword: string;
  setNewPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  showCurrentPassword: boolean;
  setShowCurrentPassword: (value: boolean) => void;
  showNewPassword: boolean;
  setShowNewPassword: (value: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (value: boolean) => void;
  passwordSaving: boolean;
  passwordErrors: PasswordErrors;
  setPasswordErrors: (errors: PasswordErrors | ((prev: PasswordErrors) => PasswordErrors)) => void;

  // Handlers
  handlePasswordChange: (e: React.FormEvent) => Promise<void>;
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

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

export function usePasswordValidation({
  user,
  supabase,
}: UsePasswordValidationParams): UsePasswordValidationReturn {
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<PasswordErrors>({});

  const handlePasswordChange = useCallback(async (e: React.FormEvent) => {
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
  }, [currentPassword, newPassword, confirmPassword, user, supabase, showSuccessToast, showErrorToast]);

  return {
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showCurrentPassword,
    setShowCurrentPassword,
    showNewPassword,
    setShowNewPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    passwordSaving,
    passwordErrors,
    setPasswordErrors,
    handlePasswordChange,
  };
}

export { validatePassword };

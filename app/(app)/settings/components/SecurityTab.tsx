"use client";

import { createClient } from "@/lib/supabase/client";
import { useApp } from "@/app/providers/AppProvider";
import { Lock } from "lucide-react";
import { usePasswordValidation } from "./security/usePasswordValidation";
import { PasswordChangeForm } from "./security/PasswordChangeForm";

export function SecurityTab() {
  const supabase = createClient();
  const { user } = useApp();

  const {
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
  } = usePasswordValidation({ user, supabase });

  return (
    <div className="bg-surface-card border border-border rounded-2xl p-6 space-y-6">
      <h2 className="text-base font-bold text-text-primary font-display border-b border-border/40 pb-3 flex items-center gap-2">
        <Lock className="w-5 h-5 text-primary" />
        Keamanan & Password
      </h2>

      <PasswordChangeForm
        currentPassword={currentPassword}
        setCurrentPassword={setCurrentPassword}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        showCurrentPassword={showCurrentPassword}
        setShowCurrentPassword={setShowCurrentPassword}
        showNewPassword={showNewPassword}
        setShowNewPassword={setShowNewPassword}
        showConfirmPassword={showConfirmPassword}
        setShowConfirmPassword={setShowConfirmPassword}
        passwordSaving={passwordSaving}
        passwordErrors={passwordErrors}
        setPasswordErrors={setPasswordErrors}
        onSubmit={handlePasswordChange}
      />
    </div>
  );
}

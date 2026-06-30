import { Button } from "@/components/ui/atoms/Button";
import { FormField } from "@/components/ui/molecules/FormField";
import { PasswordInput } from "@/components/ui/atoms/PasswordInput";
import { Check, AlertCircle } from "lucide-react";
import { validatePassword } from "../../hooks";

interface PasswordChangeFormProps {
  currentPassword: string;
  setCurrentPassword: (value: string) => void;
  newPassword: string;
  setNewPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  passwordSaving: boolean;
  passwordErrors: {
    current?: string;
    new?: string;
    confirm?: string;
  };
  setPasswordErrors: (errors: any) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export function PasswordChangeForm({
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  passwordSaving,
  passwordErrors,
  setPasswordErrors,
  onSubmit,
}: PasswordChangeFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Current Password */}
      <FormField
        label="Password Saat Ini"
        required
        error={passwordErrors.current}
      >
        <PasswordInput
          value={currentPassword}
          onChange={(e) => {
            setCurrentPassword(e.target.value);
            setPasswordErrors((prev: any) => ({ ...prev, current: undefined }));
          }}
          placeholder="Masukkan password saat ini"
          hasError={!!passwordErrors.current}
        />
      </FormField>

      {/* New Password */}
      <FormField
        label="Password Baru"
        required
        error={passwordErrors.new}
      >
        <PasswordInput
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value);
            setPasswordErrors((prev: any) => ({ ...prev, new: undefined }));
          }}
          placeholder="Masukkan password baru"
          hasError={!!passwordErrors.new}
        />
      </FormField>

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
      <FormField
        label="Konfirmasi Password Baru"
        required
        error={passwordErrors.confirm}
      >
        <PasswordInput
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setPasswordErrors((prev: any) => ({ ...prev, confirm: undefined }));
          }}
          placeholder="Masukkan ulang password baru"
          hasError={!!passwordErrors.confirm}
          rightElement={
            confirmPassword && newPassword === confirmPassword && !passwordErrors.confirm && (
              <Check className="w-4 h-4 text-success" />
            )
          }
        />
      </FormField>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-border/40">
        <Button
          type="submit"
          variant="primary"
          size="sm"
          isLoading={passwordSaving}
          className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider"
          disabled={!currentPassword || !newPassword || !confirmPassword}
        >
          Update Password
        </Button>
      </div>
    </form>
  );
}

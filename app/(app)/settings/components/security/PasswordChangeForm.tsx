import { Button } from "@/components/ui/atoms/Button";
import { Eye, EyeOff, Check, AlertCircle } from "lucide-react";
import { validatePassword } from "./usePasswordValidation";

interface PasswordChangeFormProps {
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
  showCurrentPassword,
  setShowCurrentPassword,
  showNewPassword,
  setShowNewPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  passwordSaving,
  passwordErrors,
  setPasswordErrors,
  onSubmit,
}: PasswordChangeFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
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
              setPasswordErrors((prev: any) => ({ ...prev, current: undefined }));
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
            {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
              setPasswordErrors((prev: any) => ({ ...prev, new: undefined }));
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
              setPasswordErrors((prev: any) => ({ ...prev, confirm: undefined }));
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

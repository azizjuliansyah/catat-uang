"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createUser } from "@/app/admin/actions/users";
import { Button } from "@/components/ui/atoms/Button";
import {
  ArrowLeft,
  Mail,
  User,
  Shield,
  Lock,
  Check,
  AlertCircle,
  Eye,
  EyeOff
} from "lucide-react";

export default function NewUserPage() {
  const router = useRouter();

  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState<"admin" | "user">("user");
  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormPassword(password);
    setShowPassword(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validation
    if (!formName.trim()) {
      setErrorMsg("Nama lengkap harus diisi");
      return;
    }
    if (!formEmail.trim()) {
      setErrorMsg("Email harus diisi");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formEmail)) {
      setErrorMsg("Format email tidak valid");
      return;
    }
    if (!formPassword || formPassword.length < 8) {
      setErrorMsg("Password minimal 8 karakter");
      return;
    }

    try {
      setSubmitting(true);

      // Create user via Server Action
      await createUser(formName, formEmail, formPassword, formRole);

      // Save success email in sessionStorage to display toast on user list page
      sessionStorage.setItem("userCreatedSuccess", formEmail);

      // Redirect to user list page immediately
      router.push("/admin/users");
    } catch (err: unknown) {
      console.error("Error creating user:", err);
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg || "Gagal membuat pengguna. Silakan coba lagi.");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Toast Messages */}
      {successMsg && (
        <div className="fixed top-4 right-4 z-50 bg-success/15 border border-success/30 text-success px-4 py-3 rounded-xl flex items-center gap-2 shadow-lg">
          <Check className="w-4 h-4" />
          <span className="text-sm font-semibold">{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="fixed top-4 right-4 z-50 bg-danger/15 border border-danger/30 text-danger px-4 py-3 rounded-xl flex items-center gap-2 shadow-lg">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm font-semibold">{errorMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/users"
          className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Buat Pengguna Baru</h1>
          <p className="text-sm text-text-secondary mt-0.5">Tambahkan pengguna baru ke sistem CatatUang.</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-surface-card border border-border rounded-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-text-secondary mb-1.5">
              <User className="w-4 h-4" />
              Nama Lengkap <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Masukkan nama lengkap"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-input border border-border focus:border-primary focus:outline-none rounded-xl text-sm text-text-primary font-medium"
            />
          </div>

          {/* Email */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-text-secondary mb-1.5">
              <Mail className="w-4 h-4" />
              Email <span className="text-danger">*</span>
            </label>
            <input
              type="email"
              required
              placeholder="contoh@email.com"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-input border border-border focus:border-primary focus:outline-none rounded-xl text-sm text-text-primary font-medium"
            />
          </div>

          {/* Password */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-text-secondary mb-1.5">
              <Lock className="w-4 h-4" />
              Password <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Minimal 8 karakter"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                minLength={8}
                className="w-full px-4 py-2.5 bg-surface-input border border-border focus:border-primary focus:outline-none rounded-xl text-sm text-text-primary font-mono pr-20"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <Button
                  variant="ghost"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1.5 text-text-secondary hover:text-text-primary rounded-lg transition-colors min-h-0 h-auto"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  onClick={generatePassword}
                  className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-lg hover:bg-primary/20 transition-colors min-h-0 h-auto"
                >
                  Generate
                </Button>
              </div>
            </div>
            <p className="text-xs text-text-secondary mt-1">
              Password minimal 8 karakter. Disarankan menggunakan generate untuk keamanan.
            </p>
          </div>

          {/* Role */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-text-secondary mb-1.5">
              <Shield className="w-4 h-4" />
              Peran (Role) <span className="text-danger">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3 bg-surface-input p-1 rounded-xl">
              <Button
                variant="ghost"
                onClick={() => setFormRole("user")}
                className={`py-2.5 text-sm font-semibold rounded-lg transition-all min-h-0 h-auto ${
                  formRole === "user"
                    ? "bg-surface-card text-text-primary border border-border shadow-sm"
                    : "text-text-secondary hover:text-text-primary hover:bg-transparent"
                }`}
              >
                User
              </Button>
              <Button
                variant="ghost"
                onClick={() => setFormRole("admin")}
                className={`py-2.5 text-sm font-semibold rounded-lg transition-all min-h-0 h-auto ${
                  formRole === "admin"
                    ? "bg-surface-card text-text-primary border border-border shadow-sm"
                    : "text-text-secondary hover:text-text-primary hover:bg-transparent"
                }`}
              >
                Admin
              </Button>
            </div>
            <p className="text-xs text-text-secondary mt-1">
              <strong>User:</strong> Akses penuh ke fitur keuangan pribadi.
              <strong> Admin:</strong> Akses ke panel admin untuk kelola pengguna dan audit log.
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="text-xs text-text-secondary leading-relaxed">
              <p className="font-medium text-text-primary mb-1">Informasi Pembuatan Akun</p>
              <ul className="space-y-0.5 list-disc list-inside">
                <li>Akun akan langsung aktif setelah dibuat</li>
                <li>Kategori default akan otomatis dibuat untuk pengguna baru</li>
                <li>Tindakan ini akan dicatat dalam audit log sistem</li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Link
              href="/admin/users"
              className="flex-1 px-4 py-2.5 bg-surface-input hover:bg-surface-hover border border-border text-text-primary rounded-xl text-sm font-semibold transition-colors text-center cursor-pointer"
            >
              Batal
            </Link>
            <Button
              type="submit"
              isLoading={submitting}
              className="flex-1"
            >
              Buat Pengguna
            </Button>
          </div>
        </form>
      </div>

    </div>
  );
}

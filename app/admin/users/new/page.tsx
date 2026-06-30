"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/atoms/Button";
import { Input } from "@/components/ui/atoms/Input";
import { PasswordInput } from "@/components/ui/atoms/PasswordInput";
import { FormField } from "@/components/ui/molecules/FormField";
import { PageHeader } from "@/components/ui/molecules/PageHeader";
import { Check, AlertCircle } from "lucide-react";
import { useNewUserState, useNewUserHandlers } from "../hooks";

export default function NewUserPage() {
  const router = useRouter();
  const state = useNewUserState();
  const handlers = useNewUserHandlers(state);

  const {
    formName,
    setFormName,
    formEmail,
    setFormEmail,
    formPassword,
    setFormPassword,
    formRole,
    setFormRole,
    submitting,
    errorMsg,
    successMsg,
    generatePassword,
  } = state;

  const { handleSubmit } = handlers;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Toast Messages */}
      {successMsg && (
        <div className="fixed top-4 right-4 z-50 bg-success/15 border border-success/30 text-success px-4 py-3 rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span className="text-sm font-semibold">{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="fixed top-4 right-4 z-50 bg-danger/15 border border-danger/30 text-danger px-4 py-3 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm font-semibold">{errorMsg}</span>
        </div>
      )}

      {/* Header */}
      <PageHeader
        title="Buat Pengguna Baru"
        description="Tambahkan pengguna baru ke sistem CatatUang."
        iconClassName="w-6 h-6 text-warning"
        backLink={
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-text-primary transition-colors"
          >
            ← Kembali ke Daftar
          </Link>
        }
      />

      {/* Form */}
      <div className="bg-surface-card border border-border rounded-2xl p-6">
        <form onSubmit={(e) => handleSubmit(e, router)} className="space-y-5">
          {/* Name */}
          <FormField
            label="Nama Lengkap"
            required
          >
            <Input
              type="text"
              required
              placeholder="Masukkan nama lengkap"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
          </FormField>

          {/* Email */}
          <FormField
            label="Email"
            required
          >
            <Input
              type="email"
              required
              placeholder="contoh@email.com"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
            />
          </FormField>

          {/* Password */}
          <FormField
            label="Password"
            required
            helperText="Password minimal 8 karakter. Disarankan menggunakan generate untuk keamanan."
          >
            <PasswordInput
              required
              placeholder="Minimal 8 karakter"
              value={formPassword}
              onChange={(e) => setFormPassword(e.target.value)}
              minLength={8}
              rightElement={
                <Button
                  variant="ghost"
                  onClick={generatePassword}
                  className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-lg hover:bg-primary/20 transition-colors min-h-0 h-auto"
                  type="button"
                >
                  Generate
                </Button>
              }
            />
          </FormField>

          {/* Role */}
          <FormField
            label="Peran (Role)"
            required
            helperText="User: Akses penuh ke fitur keuangan pribadi. Admin: Akses ke panel admin untuk kelola pengguna dan audit log."
          >
            <div className="grid grid-cols-2 gap-3 bg-surface-input p-1 rounded-xl">
              <Button
                variant="ghost"
                onClick={() => setFormRole("user")}
                className={`py-2.5 text-sm font-semibold rounded-lg transition-all min-h-0 h-auto ${
                  formRole === "user"
                    ? "bg-surface-card text-text-primary border border-border"
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
                    ? "bg-surface-card text-text-primary border border-border"
                    : "text-text-secondary hover:text-text-primary hover:bg-transparent"
                }`}
              >
                Admin
              </Button>
            </div>
          </FormField>

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

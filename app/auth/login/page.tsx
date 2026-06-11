"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/atoms/Button";
import { Eye, EyeOff, Mail, Lock, TrendingUp } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validate = () => {
    let isValid = true;
    if (!email) {
      setEmailError("Email tidak boleh kosong");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Format email tidak valid");
      isValid = false;
    } else {
      setEmailError("");
    }

    if (!password) {
      setPasswordError("Password tidak boleh kosong");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Password minimal 6 karakter");
      isValid = false;
    } else {
      setPasswordError("");
    }

    return isValid;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!validate()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message === "Invalid login credentials"
          ? "Email atau password salah."
          : error.message
        );
        setLoading(false);
        return;
      }

      if (data?.user) {
        // Redirection is handled by the router; middleware will guide the user.
        // We do a hard refresh or router push to trigger middleware path checking.
        router.refresh();
        const role = data.user.app_metadata?.role || "user";
        const status = data.user.app_metadata?.status || "active";

        if (status === "suspended") {
          router.push("/suspended");
        } else {
          router.push(role === "admin" ? "/admin" : "/dashboard");
        }
      }
    } catch (err) {
      setErrorMsg("Terjadi kesalahan sistem. Silakan coba lagi.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface px-4 sm:px-6 lg:px-8 relative overflow-hidden select-none">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="w-full max-w-md space-y-8 z-10">
        {/* Branding/Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary mb-4 animate-pulse">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-text-primary font-sans">
            Catat<span className="text-primary font-bold">Uang</span>
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Kelola keuangan pribadi dengan presisi dan transparansi.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-surface-card border border-border rounded-xl p-6 sm:p-8 shadow-sm backdrop-blur-sm relative">
          <form onSubmit={handleLogin} className="space-y-6">
            {errorMsg && (
              <div className="p-3 text-sm text-danger bg-danger/10 border border-danger/20 rounded-md">
                {errorMsg}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-text-primary">
                Alamat Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError("");
                  }}
                  className={`block w-full pl-10 pr-3 py-2 bg-surface-input border ${
                    emailError ? "border-danger focus:ring-danger/25" : "border-border focus:ring-primary/25"
                  } rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 text-sm transition-all`}
                  placeholder="nama@email.com"
                  disabled={loading}
                />
              </div>
              {emailError && (
                <p className="text-xs text-danger mt-1">{emailError}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="block text-sm font-medium text-text-primary">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError("");
                  }}
                  className={`block w-full pl-10 pr-10 py-2 bg-surface-input border ${
                    passwordError ? "border-danger focus:ring-danger/25" : "border-border focus:ring-primary/25"
                  } rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 text-sm transition-all`}
                  placeholder="••••••••"
                  disabled={loading}
                />
                <Button
                  variant="ghost"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-primary transition-colors min-h-0 h-auto p-0 hover:bg-transparent"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {passwordError && (
                <p className="text-xs text-danger mt-1">{passwordError}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              isLoading={loading}
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md text-sm font-medium transition-all shadow-md active:scale-[0.98]"
            >
              Masuk
            </Button>
          </form>
        </div>

        {/* Footer/Help links */}
        <p className="text-center text-xs text-text-muted font-mono">
          CatatUang Financial System v1.0.0
        </p>
      </div>
    </div>
  );
}

"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/atoms/Button";
import { Input } from "@/components/ui/atoms/Input";
import { PasswordInput } from "@/components/ui/atoms/PasswordInput";
import { FormField } from "@/components/ui/molecules/FormField";
import { useLoginState, useLoginHandlers } from "./hooks";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const state = useLoginState();
  const handlers = useLoginHandlers(state);

  const {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    errorMsg,
    setErrorMsg,
    emailError,
    setEmailError,
    passwordError,
    setPasswordError,
  } = state;

  const { handleLogin } = handlers;

  useEffect(() => {
    // 1. Check query parameters for auth errors
    const errorParam = searchParams.get("error");
    const errorDescParam = searchParams.get("error_description");

    if (errorParam) {
      setTimeout(() => {
        if (errorParam === "auth-code-error") {
          setErrorMsg("Tautan verifikasi atau atur ulang password tidak valid atau telah kedaluwarsa.");
        } else {
          setErrorMsg(errorDescParam || "Terjadi kesalahan autentikasi.");
        }
      }, 0);
      return;
    }

    // 2. Check hash parameters (Supabase sends errors in hash fragment)
    if (typeof window !== "undefined" && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const hashError = hashParams.get("error");
      const hashErrorDescription = hashParams.get("error_description");
      const hashErrorCode = hashParams.get("error_code");

      if (hashError) {
        setTimeout(() => {
          if (hashErrorCode === "otp_expired" || hashErrorDescription?.includes("expired")) {
            setErrorMsg("Tautan verifikasi atau atur ulang password telah kedaluwarsa. Silakan kirim ulang permohonan.");
          } else {
            setErrorMsg(hashErrorDescription || "Tautan tidak valid.");
          }
        }, 0);
      }
    }
  }, [searchParams, setErrorMsg]);

  return (
    <div className="relative h-[100dvh] w-full flex items-center justify-center lg:justify-end p-4 sm:p-6 lg:p-12 xl:p-16 bg-surface select-none overflow-hidden">
      {/* Background Image: Fullscreen (hidden on mobile, visible on desktop) */}
      <div className="absolute inset-0 z-0 hidden lg:block">
        <Image
          src="/login.webp"
          alt="CatatUang Login Background"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>

      {/* Floating Login Card Form */}
      <div className="w-full max-w-md bg-transparent lg:bg-surface-card/90 lg:backdrop-blur-md border-0 lg:border lg:border-border/50 rounded-none lg:rounded-2xl p-0 lg:p-6 lg:sm:p-8 shadow-none lg:shadow-2xl z-10 transition-all duration-300 lg:hover:shadow-primary/5">
        {/* Logo, Title & Subtitle */}
        <div className="flex flex-col items-center justify-center text-center mb-6">
          <div className="inline-flex items-center justify-center w-24 h-24">
            <Image
              src="/icon-192x192.png"
              alt="CatatUang Logo"
              width={192}
              height={192}
              priority
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary font-sans">
            Catat<span className="text-primary font-bold">Uang</span>
          </h1>
          <p className="mt-1.5 text-xs text-text-secondary max-w-[280px]">
            Kelola keuangan pribadi dengan presisi dan transparansi.
          </p>
        </div>

        <form onSubmit={(e) => handleLogin(e, router)} className="space-y-5 px-6 sm:px-0">
          {errorMsg && (
            <div className="p-3 text-sm text-danger bg-danger/10 border border-danger/20 rounded-md">
              {errorMsg}
            </div>
          )}

          {/* Email Field */}
          <FormField
            label="Alamat Email"
            error={emailError}
          >
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError("");
              }}
              placeholder="nama@email.com"
              disabled={loading}
              hasError={!!emailError}
            />
          </FormField>

          {/* Password Field */}
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-sm font-semibold text-text-secondary">Password</span>
            <Link href="/forgot-password" className="text-xs text-primary hover:underline">
              Lupa Password?
            </Link>
          </div>
          <FormField error={passwordError} label="">
            <PasswordInput
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError("");
              }}
              hasError={!!passwordError}
              disabled={loading}
            />
          </FormField>

          {/* Submit Button */}
          <Button
            type="submit"
            isLoading={loading}
            className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md text-sm font-medium transition-all active:scale-[0.98]"
          >
            Masuk
          </Button>

          {/* Go to Register Link */}
          <p className="text-center text-sm text-text-secondary mt-4">
            Belum punya akun?{" "}
            <Link href="/register" className="text-primary font-medium hover:underline">
              Daftar
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <p className="text-xs text-text-secondary animate-pulse font-sans">Memuat...</p>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

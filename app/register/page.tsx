"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/atoms/Button";
import { Input } from "@/components/ui/atoms/Input";
import { PasswordInput } from "@/components/ui/atoms/PasswordInput";
import { FormField } from "@/components/ui/molecules/FormField";
import { useRegisterState, useRegisterHandlers } from "./hooks";

export default function RegisterPage() {
  const router = useRouter();
  const state = useRegisterState();
  const handlers = useRegisterHandlers(state);

  const {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    errorMsg,
    successMsg,
    nameError,
    setNameError,
    emailError,
    setEmailError,
    passwordError,
    setPasswordError,
    confirmPasswordError,
    setConfirmPasswordError,
  } = state;

  const { handleRegister } = handlers;

  return (
    <div className="relative h-[100dvh] w-full flex items-center justify-center lg:justify-end p-4 sm:p-6 lg:p-12 xl:p-16 bg-surface select-none overflow-hidden">
      {/* Background Image: Fullscreen (hidden on mobile, visible on desktop) */}
      <div className="absolute inset-0 z-0 hidden lg:block">
        <Image
          src="/register.webp"
          alt="CatatUang Register Background"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>

      {/* Floating Register Card Form */}
      <div className="w-full max-w-md bg-transparent lg:bg-surface-card/90 lg:backdrop-blur-md border-0 lg:border lg:border-border/50 rounded-none lg:rounded-2xl p-0 lg:p-6 lg:sm:p-8 shadow-none lg:shadow-2xl z-10 transition-all duration-300 lg:hover:shadow-primary/5">
        {/* Logo, Title & Subtitle */}
        <div className="flex flex-col items-center justify-center text-center mb-3 lg:mb-5">
          <div className="inline-flex items-center justify-center w-16 h-16 lg:w-20 lg:h-20">
            <Image
              src="/icon-192x192.png"
              alt="CatatUang Logo"
              width={128}
              height={128}
              priority
              className="object-contain"
            />
          </div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-text-primary font-sans">
            Catat<span className="text-primary font-bold">Uang</span>
          </h1>
          <p className="mt-1 text-xs text-text-secondary max-w-[280px]">
            Kelola keuangan pribadi dengan presisi dan transparansi.
          </p>
        </div>

        <form onSubmit={(e) => handleRegister(e, router)} className="space-y-3.5 lg:space-y-5 px-6 sm:px-0">
          {errorMsg && (
            <div className="p-2.5 text-xs text-danger bg-danger/10 border border-danger/20 rounded-md">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-2.5 text-xs text-success bg-accent-success/10 border border-accent-success/20 rounded-md">
              {successMsg}
            </div>
          )}

          {/* Name Field */}
          <FormField
            label="Nama Lengkap"
            error={nameError}
          >
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError("");
              }}
              placeholder="Nama Anda"
              disabled={loading}
              hasError={!!nameError}
            />
          </FormField>

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
          <FormField
            label="Password"
            error={passwordError}
          >
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

          {/* Confirm Password Field */}
          <FormField
            label="Konfirmasi Password"
            error={confirmPasswordError}
          >
            <PasswordInput
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (confirmPasswordError) setConfirmPasswordError("");
              }}
              hasError={!!confirmPasswordError}
              disabled={loading}
            />
          </FormField>

          {/* Submit Button */}
          <Button
            type="submit"
            isLoading={loading}
            className="w-full flex justify-center items-center py-2 lg:py-2.5 px-4 border border-transparent rounded-md text-sm font-medium transition-all active:scale-[0.98]"
          >
            Daftar Akun
          </Button>

          {/* Back to Login link */}
          <p className="text-center text-xs lg:text-sm text-text-secondary mt-2.5 lg:mt-4">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Masuk
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

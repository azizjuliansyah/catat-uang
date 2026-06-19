"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/providers/AppProvider";
import { Spinner } from "@/components/ui/atoms/Spinner";

export default function Home() {
  const router = useRouter();
  const { user, loadingUser } = useApp();

  useEffect(() => {
    if (!loadingUser) {
      if (!user) {
        router.push("/login");
      } else {
        const role = user.app_metadata?.role || "user";
        const status = user.app_metadata?.status || "active";

        if (status === "suspended") {
          router.push("/suspended");
        } else {
          router.push(role === "admin" ? "/admin" : "/dashboard");
        }
      }
    }
  }, [user, loadingUser, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" className="text-primary" />
        <p className="text-xs text-text-secondary animate-pulse font-sans">Memuat...</p>
      </div>
    </div>
  );
}

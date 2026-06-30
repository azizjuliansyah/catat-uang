"use client";

import { useApp } from "@/app/providers/AppProvider";
import { LayoutDashboard } from "lucide-react";
import { PageHeader } from "@/components/ui/molecules/PageHeader";
import { AdminBanner, AdminUserCard, AdminAuditLogCard, AdminStatsCards } from "./components";
import { useAdminStats } from "./hooks";
import { AdminDashboardPageSkeleton } from "./page.skeleton";

export default function AdminDashboardPage() {
  const { user, loadingUser } = useApp();
  const { stats, loading: statsLoading } = useAdminStats();

  // Show skeleton during initial load
  if (loadingUser || statsLoading) {
    return <AdminDashboardPageSkeleton />;
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <PageHeader
        icon={LayoutDashboard}
        iconClassName="w-6 h-6 text-warning"
        title="Dashboard Admin"
        description="Ringkasan aktivitas sistem dan statistik pengguna."
      />

      {/* Banner */}
      <AdminBanner />

      {/* Stats Cards */}
      <AdminStatsCards stats={stats} loading={statsLoading} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* User Management Section */}
        <AdminUserCard userEmail={user?.email} />

        {/* Audit Logs Section */}
        <AdminAuditLogCard userEmail={user?.email} />
      </div>
    </div>
  );
}

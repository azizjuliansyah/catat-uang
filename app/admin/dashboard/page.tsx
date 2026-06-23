"use client";

import { useApp } from "@/app/providers/AppProvider";
import { AdminBanner } from "./components/AdminBanner";
import { AdminUserCard } from "./components/AdminUserCard";
import { AdminAuditLogCard } from "./components/AdminAuditLogCard";

export default function AdminDashboardPage() {
  const { user } = useApp();

  return (
    <div className="space-y-6 font-sans">
      {/* Banner */}
      <AdminBanner />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Management Section */}
        <AdminUserCard userEmail={user?.email} />

        {/* Audit Logs Section */}
        <AdminAuditLogCard userEmail={user?.email} />
      </div>
    </div>
  );
}

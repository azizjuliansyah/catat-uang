"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export interface AdminStatsData {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  totalAdmins: number;
}

export async function getAdminStats(): Promise<AdminStatsData> {
  const adminSupabase = await createAdminClient();

  const { data: dbUsers, error } = await adminSupabase
    .from("users")
    .select("role, status");

  if (error) throw error;
  if (!dbUsers) {
    return {
      totalUsers: 0,
      activeUsers: 0,
      suspendedUsers: 0,
      totalAdmins: 0,
    };
  }

  const totalUsers = dbUsers.length;
  const activeUsers = dbUsers.filter((u) => u.status === "active").length;
  const suspendedUsers = dbUsers.filter((u) => u.status === "suspended").length;
  const totalAdmins = dbUsers.filter((u) => u.role === "admin").length;

  return {
    totalUsers,
    activeUsers,
    suspendedUsers,
    totalAdmins,
  };
}

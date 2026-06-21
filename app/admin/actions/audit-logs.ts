"use server";

import { createAdminClient } from "@/lib/supabase/admin";

// Fetch audit logs
export async function getAuditLogs() {
  const adminSupabase = await createAdminClient();
  const { data: logs, error: logsError } = await adminSupabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  if (logsError) throw logsError;
  if (!logs) return [];

  // Fetch names and details from public.users table
  const { data: dbUsers, error: dbError } = await adminSupabase
    .from("users")
    .select("id, name");

  if (dbError) throw dbError;

  // Fetch emails from auth.users via admin API
  const { data: { users: authUsers }, error: authError } = await adminSupabase.auth.admin.listUsers({
    perPage: 1000
  });

  if (authError) throw authError;

  const nameMap = new Map<string, string>();
  if (dbUsers) {
    dbUsers.forEach((u) => {
      if (u.name) nameMap.set(u.id, u.name);
    });
  }

  const emailMap = new Map<string, string>();
  if (authUsers) {
    authUsers.forEach((u) => {
      if (u.email) emailMap.set(u.id, u.email);
    });
  }

  return logs.map((log) => {
    const actorId = log.actor_id;
    return {
      ...log,
      actor_user: actorId ? {
        email: emailMap.get(actorId) || `user_${actorId.slice(0, 8)}`,
        name: nameMap.get(actorId) || null
      } : null
    };
  });
}

// Get user audit logs
export async function getUserAuditLogs(userId: string) {
  const adminSupabase = await createAdminClient();
  const { data: logs, error: logsError } = await adminSupabase
    .from("audit_logs")
    .select("*")
    .eq("target_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (logsError) throw logsError;
  if (!logs) return [];

  const { data: { users: authUsers }, error: authError } = await adminSupabase.auth.admin.listUsers({
    perPage: 1000
  });

  if (authError) throw authError;

  const emailMap = new Map<string, string>();
  if (authUsers) {
    authUsers.forEach((u) => {
      if (u.email) emailMap.set(u.id, u.email);
    });
  }

  return logs.map((log) => {
    const actorId = log.actor_id;
    return {
      ...log,
      users: actorId ? {
        email: emailMap.get(actorId) || `user_${actorId.slice(0, 8)}`
      } : null
    };
  });
}

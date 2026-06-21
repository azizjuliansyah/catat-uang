"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";

// Fetch admin users
export async function getAdminUsers() {
  const adminSupabase = await createAdminClient();
  const { data: dbUsers, error: dbError } = await adminSupabase
    .from("users")
    .select("id, name")
    .eq("role", "admin");

  if (dbError) throw dbError;
  if (!dbUsers) return [];

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

  return dbUsers.map((user) => ({
    ...user,
    email: emailMap.get(user.id) || ""
  }));
}

// Fetch all users
export async function getUsers() {
  const adminSupabase = await createAdminClient();
  const { data: dbUsers, error: dbError } = await adminSupabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (dbError) throw dbError;
  if (!dbUsers) return [];

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

  return dbUsers.map((user) => ({
    ...user,
    email: emailMap.get(user.id) || ""
  }));
}

// Toggle suspend user status
export async function toggleSuspendUser(userId: string, currentStatus: "active" | "suspended", userEmail: string) {
  const adminSupabase = await createAdminClient();
  const serverSupabase = await createServerClient();
  
  const { data: { user: actorUser } } = await serverSupabase.auth.getUser();
  if (!actorUser) throw new Error("Unauthorized");

  const newStatus = currentStatus === "active" ? "suspended" : "active";

  // Update in public.users
  const { error: dbError } = await adminSupabase
    .from("users")
    .update({ status: newStatus })
    .eq("id", userId);

  if (dbError) throw dbError;

  // Update in auth.users using admin API
  const { error: authError } = await adminSupabase.auth.admin.updateUserById(userId, {
    user_metadata: { status: newStatus }
  });

  if (authError) throw authError;

  // Log to audit_logs
  const { error: logError } = await adminSupabase.from("audit_logs").insert([{
    actor_id: actorUser.id,
    action: newStatus === "suspended" ? "suspend_user" : "unsuspend_user",
    target_type: "user",
    target_id: userId,
    details: { email: userEmail, new_status: newStatus }
  }]);

  if (logError) console.error("Error writing audit log:", logError);

  return newStatus;
}

// Delete user
export async function deleteUser(userId: string, userEmail: string) {
  const adminSupabase = await createAdminClient();
  const serverSupabase = await createServerClient();

  const { data: { user: actorUser } } = await serverSupabase.auth.getUser();
  if (!actorUser) throw new Error("Unauthorized");

  // Log to audit_logs before deleting
  const { error: logError } = await adminSupabase.from("audit_logs").insert([{
    actor_id: actorUser.id,
    action: "delete_user",
    target_type: "user",
    target_id: userId,
    details: { email: userEmail }
  }]);

  if (logError) console.error("Error writing audit log:", logError);

  // Delete from auth.users (cascade will handle public.users)
  const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(userId);
  if (deleteError) throw deleteError;

  return true;
}

// Reset password
export async function resetPassword(userId: string, userEmail: string) {
  const adminSupabase = await createAdminClient();
  const serverSupabase = await createServerClient();

  const { data: { user: actorUser } } = await serverSupabase.auth.getUser();
  if (!actorUser) throw new Error("Unauthorized");

  // Generate a temporary password
  const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

  // Update user password via admin API
  const { error: authError } = await adminSupabase.auth.admin.updateUserById(userId, {
    password: tempPassword
  });

  if (authError) throw authError;

  // Log to audit_logs
  const { error: logError } = await adminSupabase.from("audit_logs").insert([{
    actor_id: actorUser.id,
    action: "reset_password",
    target_type: "user",
    target_id: userId,
    details: { email: userEmail, temp_password: tempPassword }
  }]);

  if (logError) console.error("Error writing audit log:", logError);

  return tempPassword;
}

// Create user
export async function createUser(formName: string, formEmail: string, formPassword: string, formRole: "admin" | "user") {
  const adminSupabase = await createAdminClient();
  const serverSupabase = await createServerClient();

  const { data: { user: actorUser } } = await serverSupabase.auth.getUser();
  if (!actorUser) throw new Error("Unauthorized");

  // Create user via Supabase Admin API
  const { data: newUser, error: createError } = await adminSupabase.auth.admin.createUser({
    email: formEmail.trim(),
    password: formPassword,
    email_confirm: true,
    user_metadata: {
      name: formName.trim(),
      role: formRole,
      status: "active"
    },
    app_metadata: {
      role: formRole,
      status: "active"
    }
  });

  if (createError) throw createError;

  // Log to audit_logs
  const { error: logError } = await adminSupabase.from("audit_logs").insert([{
    actor_id: actorUser.id,
    action: "create_user",
    target_type: "user",
    target_id: newUser.user.id,
    details: {
      email: formEmail.trim(),
      name: formName.trim(),
      role: formRole
    }
  }]);

  if (logError) console.error("Error writing audit log:", logError);

  return newUser.user;
}

// Get user details
export async function getUserDetails(userId: string) {
  const adminSupabase = await createAdminClient();
  const { data: dbUser, error: dbError } = await adminSupabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (dbError) throw dbError;

  const { data: authUser, error: authError } = await adminSupabase.auth.admin.getUserById(userId);
  if (authError) throw authError;

  return {
    ...dbUser,
    email: authUser.user.email || ""
  };
}

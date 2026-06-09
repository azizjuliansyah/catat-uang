"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";

// 1. Fetch audit logs
export async function getAuditLogs() {
  const adminSupabase = await createAdminClient();
  const { data, error } = await adminSupabase
    .from("audit_logs")
    .select(`
      *,
      actor_user:users!audit_logs_actor_id_fkey (email, name)
    `)
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) throw error;
  return data || [];
}

// 2. Fetch admin users
export async function getAdminUsers() {
  const adminSupabase = await createAdminClient();
  const { data, error } = await adminSupabase
    .from("users")
    .select("id, email, name")
    .eq("role", "admin");

  if (error) throw error;
  return data || [];
}

// 3. Fetch all users
export async function getUsers() {
  const adminSupabase = await createAdminClient();
  const { data, error } = await adminSupabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

// 4. Toggle suspend user status
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

// 5. Delete user
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

// 6. Reset password
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

// 7. Create user
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

  // Insert into public.users table
  const { error: dbError } = await adminSupabase.from("users").insert([{
    id: newUser.user.id,
    email: formEmail.trim(),
    name: formName.trim(),
    role: formRole,
    status: "active"
  }]);

  if (dbError) throw dbError;

  // Seed default categories for the new user
  const { error: categoriesError } = await adminSupabase.from("categories").insert([
    { user_id: newUser.user.id, name: "Gaji", type: "income", icon: "Briefcase", color: "#10B981" },
    { user_id: newUser.user.id, name: "Investasi", type: "income", icon: "TrendingUp", color: "#3B82F6" },
    { user_id: newUser.user.id, name: "Makanan & Minuman", type: "expense", icon: "Utensils", color: "#EF4444" },
    { user_id: newUser.user.id, name: "Transportasi", type: "expense", icon: "Car", color: "#F59E0B" },
    { user_id: newUser.user.id, name: "Belanja", type: "expense", icon: "ShoppingBag", color: "#EC4899" },
    { user_id: newUser.user.id, name: "Utilitas & Tagihan", type: "expense", icon: "FileText", color: "#8B5CF6" },
    { user_id: newUser.user.id, name: "Hiburan", type: "expense", icon: "Film", color: "#6366F1" },
    { user_id: newUser.user.id, name: "Lainnya", type: "expense", icon: "HelpCircle", color: "#71717a" },
  ]);

  if (categoriesError) console.error("Error seeding categories:", categoriesError);

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

// 8. Get user details
export async function getUserDetails(userId: string) {
  const adminSupabase = await createAdminClient();
  const { data, error } = await adminSupabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
}

// 9. Get user audit logs
export async function getUserAuditLogs(userId: string) {
  const adminSupabase = await createAdminClient();
  const { data, error } = await adminSupabase
    .from("audit_logs")
    .select(`
      *,
      users:users!audit_logs_actor_id_fkey (email)
    `)
    .eq("target_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw error;
  return data || [];
}

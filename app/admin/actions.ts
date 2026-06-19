"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";

// 1. Fetch audit logs
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


// 2. Fetch admin users
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


// 3. Fetch all users
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


// 9. Get user audit logs
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

// 10. CRUD Category Templates
export async function getCategoryTemplates() {
  const serverSupabase = await createServerClient();
  const { data, error } = await serverSupabase
    .from("category_templates")
    .select("*")
    .order("type", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createCategoryTemplate(
  name: string,
  type: "income" | "expense",
  icon: string,
  color: string
) {
  const adminSupabase = await createAdminClient();
  const serverSupabase = await createServerClient();
  
  const { data: { user: actorUser } } = await serverSupabase.auth.getUser();
  if (!actorUser || actorUser.app_metadata?.role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }

  const { data, error } = await adminSupabase
    .from("category_templates")
    .insert([{ name: name.trim(), type, icon, color }])
    .select()
    .single();

  if (error) throw error;

  // Log to audit_logs
  const { error: logError } = await adminSupabase.from("audit_logs").insert([{
    actor_id: actorUser.id,
    action: "create_category_template",
    target_type: "category_template",
    target_id: data.id,
    details: { name: name.trim(), type, icon, color }
  }]);

  if (logError) console.error("Error writing audit log:", logError);

  return data;
}

export async function updateCategoryTemplate(
  id: string,
  name: string,
  type: "income" | "expense",
  icon: string,
  color: string
) {
  const adminSupabase = await createAdminClient();
  const serverSupabase = await createServerClient();
  
  const { data: { user: actorUser } } = await serverSupabase.auth.getUser();
  if (!actorUser || actorUser.app_metadata?.role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }

  const { data, error } = await adminSupabase
    .from("category_templates")
    .update({ name: name.trim(), type, icon, color })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  // Log to audit_logs
  const { error: logError } = await adminSupabase.from("audit_logs").insert([{
    actor_id: actorUser.id,
    action: "update_category_template",
    target_type: "category_template",
    target_id: id,
    details: { name: name.trim(), type, icon, color }
  }]);

  if (logError) console.error("Error writing audit log:", logError);

  return data;
}

export async function deleteCategoryTemplate(id: string) {
  const adminSupabase = await createAdminClient();
  const serverSupabase = await createServerClient();
  
  const { data: { user: actorUser } } = await serverSupabase.auth.getUser();
  if (!actorUser || actorUser.app_metadata?.role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }

  const { error } = await adminSupabase
    .from("category_templates")
    .delete()
    .eq("id", id);

  if (error) throw error;

  // Log to audit_logs
  const { error: logError } = await adminSupabase.from("audit_logs").insert([{
    actor_id: actorUser.id,
    action: "delete_category_template",
    target_type: "category_template",
    target_id: id,
    details: {}
  }]);

  if (logError) console.error("Error writing audit log:", logError);

  return true;
}

// 11. Sync Category Templates for authenticated user
export async function applyCategoryTemplates() {
  const serverSupabase = await createServerClient();
  
  const { data: { user } } = await serverSupabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Fetch templates
  const { data: templates, error: templatesError } = await serverSupabase
    .from("category_templates")
    .select("*");

  if (templatesError) throw templatesError;
  if (!templates || templates.length === 0) return { success: true, count: 0 };

  // Fetch user's current categories
  const { data: userCategories, error: categoriesError } = await serverSupabase
    .from("categories")
    .select("*")
    .eq("user_id", user.id);

  if (categoriesError) throw categoriesError;

  // Track existing categories by case-insensitive name + type
  const existingSet = new Set(
    (userCategories || []).map((c) => `${c.name.toLowerCase().trim()}_${c.type}`)
  );

  const categoriesToInsert = templates
    .filter((t) => !existingSet.has(`${t.name.toLowerCase().trim()}_${t.type}`))
    .map((t) => ({
      user_id: user.id,
      name: t.name,
      type: t.type,
      icon: t.icon,
      color: t.color
    }));

  if (categoriesToInsert.length === 0) {
    return { success: true, count: 0 };
  }

  const { error: insertError } = await serverSupabase
    .from("categories")
    .insert(categoriesToInsert);

  if (insertError) throw insertError;

  return { success: true, count: categoriesToInsert.length };
}



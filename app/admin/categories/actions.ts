"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";

// CRUD Category Templates
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

// Sync Category Templates for authenticated user
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

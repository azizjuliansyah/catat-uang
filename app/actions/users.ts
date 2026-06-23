"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

// Update user avatar URL
export async function updateUserAvatar(avatarUrl: string) {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  // Use admin client to bypass RLS for user's own record update
  const adminSupabase = await createAdminClient();

  const { error } = await adminSupabase
    .from("users")
    .update({ avatar_url: avatarUrl })
    .eq("id", user.id);

  if (error) throw error;

  // Also update auth metadata
  await adminSupabase.auth.admin.updateUserById(user.id, {
    user_metadata: { avatar_url: avatarUrl }
  });

  revalidatePath("/settings");

  return { success: true };
}

// Update user profile name
export async function updateUserName(name: string) {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  // Use admin client to bypass RLS for user's own record update
  const adminSupabase = await createAdminClient();

  const { error } = await adminSupabase
    .from("users")
    .update({
      name: name.trim(),
      updated_at: new Date().toISOString()
    })
    .eq("id", user.id);

  if (error) throw error;

  // Also update auth metadata
  await adminSupabase.auth.admin.updateUserById(user.id, {
    user_metadata: { name: name.trim() }
  });

  revalidatePath("/settings");

  return { success: true };
}

// Get user profile data
export async function getUserProfile() {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) throw error;

  return data;
}

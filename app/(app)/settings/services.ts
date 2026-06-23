/**
 * Settings Module Services
 * All Supabase operations for settings functionality
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { Category, TransactionTemplate } from "./types";

// Category Services

/**
 * Create a new category
 */
export async function createCategory(
  supabase: SupabaseClient,
  userId: string,
  data: {
    name: string;
    type: "income" | "expense";
    icon: string;
    color: string;
  }
): Promise<void> {
  const { error } = await supabase
    .from("categories")
    .insert({
      user_id: userId,
      name: data.name.trim(),
      type: data.type,
      icon: data.icon,
      color: data.color,
    });

  if (error) throw error;
}

/**
 * Update an existing category
 */
export async function updateCategory(
  supabase: SupabaseClient,
  categoryId: string,
  data: {
    name: string;
    icon: string;
    color: string;
  }
): Promise<void> {
  const { error } = await supabase
    .from("categories")
    .update({
      name: data.name.trim(),
      icon: data.icon,
      color: data.color,
    })
    .eq("id", categoryId);

  if (error) throw error;
}

/**
 * Delete a category
 */
export async function deleteCategory(
  supabase: SupabaseClient,
  categoryId: string
): Promise<void> {
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", categoryId);

  if (error) throw error;
}

// Template Services

/**
 * Create a new transaction template
 */
export async function createTemplate(
  supabase: SupabaseClient,
  userId: string,
  data: Omit<TransactionTemplate, "id" | "user_id" | "created_at" | "updated_at">
): Promise<void> {
  const { error } = await supabase
    .from("transaction_templates")
    .insert({
      user_id: userId,
      name: data.name.trim(),
      type: data.type,
      amount: data.amount,
      category_id: data.category_id,
      wallet_id: data.wallet_id,
      paylater_id: data.paylater_id,
      description: data.description,
    });

  if (error) throw error;
}

/**
 * Update an existing transaction template
 */
export async function updateTemplate(
  supabase: SupabaseClient,
  templateId: string,
  data: Omit<TransactionTemplate, "id" | "user_id" | "created_at">
): Promise<void> {
  const { error } = await supabase
    .from("transaction_templates")
    .update({
      name: data.name.trim(),
      type: data.type,
      amount: data.amount,
      category_id: data.category_id,
      wallet_id: data.wallet_id,
      paylater_id: data.paylater_id,
      description: data.description,
      updated_at: new Date().toISOString(),
    })
    .eq("id", templateId);

  if (error) throw error;
}

/**
 * Delete a transaction template
 */
export async function deleteTemplate(
  supabase: SupabaseClient,
  templateId: string
): Promise<void> {
  const { error } = await supabase
    .from("transaction_templates")
    .delete()
    .eq("id", templateId);

  if (error) throw error;
}

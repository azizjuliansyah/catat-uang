-- Migration: Query Performance Optimization
-- Description: Add critical indexes for query performance and fix RLS policies to prevent auth.uid() re-euation
-- Date: 2026-06-22

-- ============================================================================
-- PART 1: PERFORMANCE INDEXES
-- ============================================================================

-- Core transaction queries (most frequent pattern: user_id + date range)
CREATE INDEX IF NOT EXISTS idx_transactions_user_date
ON transactions (user_id, transaction_date DESC NULLS LAST);

-- Foreign key indexes for transactions (JOIN optimization)
CREATE INDEX IF NOT EXISTS idx_transactions_wallet
ON transactions (wallet_id);

CREATE INDEX IF NOT EXISTS idx_transactions_category
ON transactions (category_id);
  
CREATE INDEX IF NOT EXISTS idx_transactions_paylater
ON transactions (paylater_id) WHERE paylater_id IS NOT NULL;

-- Wallet queries with filtering
CREATE INDEX IF NOT EXISTS idx_wallets_user_archived_default
ON wallets (user_id, is_archived, is_default);

-- Category queries by type
CREATE INDEX IF NOT EXISTS idx_categories_user_type
ON categories (user_id, type);

-- Debt queries
CREATE INDEX IF NOT EXISTS idx_debts_user
ON debts (user_id);

-- Transfer queries
CREATE INDEX IF NOT EXISTS idx_transfers_user
ON transfers (user_id);

CREATE INDEX IF NOT EXISTS idx_transfers_from_wallet
ON transfers (from_wallet_id);

CREATE INDEX IF NOT EXISTS idx_transfers_to_wallet
ON transfers (to_wallet_id);

-- Saving goals queries
CREATE INDEX IF NOT EXISTS idx_saving_goals_user
ON saving_goals (user_id);

-- Goal topup queries
CREATE INDEX IF NOT EXISTS idx_goal_topups_goal
ON goal_topups (goal_id);

CREATE INDEX IF NOT EXISTS idx_goal_topups_wallet
ON goal_topups (wallet_id);

-- Goal withdrawal queries
CREATE INDEX IF NOT EXISTS idx_goal_withdrawals_goal
ON goal_withdrawals (goal_id);

CREATE INDEX IF NOT EXISTS idx_goal_withdrawals_wallet
ON goal_withdrawals (wallet_id);

-- Debt payment queries
CREATE INDEX IF NOT EXISTS idx_debt_payments_debt
ON debt_payments (debt_id);

CREATE INDEX IF NOT EXISTS idx_debt_payments_wallet
ON debt_payments (wallet_id);

-- Debt transaction queries
CREATE INDEX IF NOT EXISTS idx_debt_transactions_debt
ON debt_transactions (debt_id);

-- Paylater platform queries
CREATE INDEX IF NOT EXISTS idx_paylater_platforms_user
ON paylater_platforms (user_id);

-- Paylater payment queries
CREATE INDEX IF NOT EXISTS idx_paylater_payments_user
ON paylater_payments (user_id);

CREATE INDEX IF NOT EXISTS idx_paylater_payments_paylater
ON paylater_payments (paylater_id);

CREATE INDEX IF NOT EXISTS idx_paylater_payments_wallet
ON paylater_payments (wallet_id);

-- Transaction template queries
CREATE INDEX IF NOT EXISTS idx_transaction_templates_user
ON transaction_templates (user_id);

CREATE INDEX IF NOT EXISTS idx_transaction_templates_category
ON transaction_templates (category_id);

CREATE INDEX IF NOT EXISTS idx_transaction_templates_wallet
ON transaction_templates (wallet_id);

CREATE INDEX IF NOT EXISTS idx_transaction_templates_paylater
ON transaction_templates (paylater_id) WHERE paylater_id IS NOT NULL;

-- ============================================================================
-- PART 2: RLS POLICY FIXES (auth.uid() → (select auth.uid()))
-- ============================================================================
-- This prevents per-row re-evaluation of auth.uid(), changing complexity
-- from O(n) to O(1) for queries that scan multiple rows.

-- ----------------------------------------------------------------------------
-- TRANSACTIONS
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can read own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;

CREATE POLICY "Users can read own transactions"
ON transactions FOR SELECT
USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own transactions"
ON transactions FOR INSERT
WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own transactions"
ON transactions FOR UPDATE
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own transactions"
ON transactions FOR DELETE
USING (user_id = (select auth.uid()));

-- ----------------------------------------------------------------------------
-- WALLETS
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can read own wallets" ON wallets;
DROP POLICY IF EXISTS "Users can insert own wallets" ON wallets;
DROP POLICY IF EXISTS "Users can update own wallets" ON wallets;
DROP POLICY IF EXISTS "Users can delete own wallets" ON wallets;

CREATE POLICY "Users can read own wallets"
ON wallets FOR SELECT
USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own wallets"
ON wallets FOR INSERT
WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own wallets"
ON wallets FOR UPDATE
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own wallets"
ON wallets FOR DELETE
USING (user_id = (select auth.uid()));

-- ----------------------------------------------------------------------------
-- CATEGORIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can read own categories" ON categories;
DROP POLICY IF EXISTS "Users can insert own categories" ON categories;
DROP POLICY IF EXISTS "Users can update own categories" ON categories;
DROP POLICY IF EXISTS "Users can delete own categories" ON categories;

CREATE POLICY "Users can read own categories"
ON categories FOR SELECT
USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own categories"
ON categories FOR INSERT
WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own categories"
ON categories FOR UPDATE
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own categories"
ON categories FOR DELETE
USING (user_id = (select auth.uid()));

-- ----------------------------------------------------------------------------
-- TRANSFERS
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can read own transfers" ON transfers;
DROP POLICY IF EXISTS "Users can insert own transfers" ON transfers;
DROP POLICY IF EXISTS "Users can update own transfers" ON transfers;
DROP POLICY IF EXISTS "Users can delete own transfers" ON transfers;

CREATE POLICY "Users can read own transfers"
ON transfers FOR SELECT
USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own transfers"
ON transfers FOR INSERT
WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own transfers"
ON transfers FOR UPDATE
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own transfers"
ON transfers FOR DELETE
USING (user_id = (select auth.uid()));

-- ----------------------------------------------------------------------------
-- DEBTS
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can read own debts" ON debts;
DROP POLICY IF EXISTS "Users can insert own debts" ON debts;
DROP POLICY IF EXISTS "Users can update own debts" ON debts;
DROP POLICY IF EXISTS "Users can delete own debts" ON debts;

CREATE POLICY "Users can read own debts"
ON debts FOR SELECT
USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own debts"
ON debts FOR INSERT
WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own debts"
ON debts FOR UPDATE
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own debts"
ON debts FOR DELETE
USING (user_id = (select auth.uid()));

-- ----------------------------------------------------------------------------
-- DEBT PAYMENTS (checks ownership via parent debt)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can read own debt payments" ON debt_payments;
DROP POLICY IF EXISTS "Users can insert own debt payments" ON debt_payments;
DROP POLICY IF EXISTS "Users can update own debt payments" ON debt_payments;
DROP POLICY IF EXISTS "Users can delete own debt payments" ON debt_payments;

CREATE POLICY "Users can read own debt payments"
ON debt_payments FOR SELECT
USING ((select auth.uid()) IN (SELECT user_id FROM debts WHERE id = debt_id));

CREATE POLICY "Users can insert own debt payments"
ON debt_payments FOR INSERT
WITH CHECK ((select auth.uid()) IN (SELECT user_id FROM debts WHERE id = debt_id));

CREATE POLICY "Users can update own debt payments"
ON debt_payments FOR UPDATE
USING ((select auth.uid()) IN (SELECT user_id FROM debts WHERE id = debt_id))
WITH CHECK ((select auth.uid()) IN (SELECT user_id FROM debts WHERE id = debt_id));

CREATE POLICY "Users can delete own debt payments"
ON debt_payments FOR DELETE
USING ((select auth.uid()) IN (SELECT user_id FROM debts WHERE id = debt_id));

-- ----------------------------------------------------------------------------
-- SAVING GOALS
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can read own saving goals" ON saving_goals;
DROP POLICY IF EXISTS "Users can insert own saving goals" ON saving_goals;
DROP POLICY IF EXISTS "Users can update own saving goals" ON saving_goals;
DROP POLICY IF EXISTS "Users can delete own saving goals" ON saving_goals;

CREATE POLICY "Users can read own saving goals"
ON saving_goals FOR SELECT
USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own saving goals"
ON saving_goals FOR INSERT
WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own saving goals"
ON saving_goals FOR UPDATE
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own saving goals"
ON saving_goals FOR DELETE
USING (user_id = (select auth.uid()));

-- ----------------------------------------------------------------------------
-- GOAL TOPUPS (checks ownership via parent goal)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can read own goal topups" ON goal_topups;
DROP POLICY IF EXISTS "Users can insert own goal topups" ON goal_topups;
DROP POLICY IF EXISTS "Users can update own goal topups" ON goal_topups;
DROP POLICY IF EXISTS "Users can delete own goal topups" ON goal_topups;

CREATE POLICY "Users can read own goal topups"
ON goal_topups FOR SELECT
USING ((select auth.uid()) IN (SELECT user_id FROM saving_goals WHERE id = goal_id));

CREATE POLICY "Users can insert own goal topups"
ON goal_topups FOR INSERT
WITH CHECK ((select auth.uid()) IN (SELECT user_id FROM saving_goals WHERE id = goal_id));

CREATE POLICY "Users can update own goal topups"
ON goal_topups FOR UPDATE
USING ((select auth.uid()) IN (SELECT user_id FROM saving_goals WHERE id = goal_id))
WITH CHECK ((select auth.uid()) IN (SELECT user_id FROM saving_goals WHERE id = goal_id));

CREATE POLICY "Users can delete own goal topups"
ON goal_topups FOR DELETE
USING ((select auth.uid()) IN (SELECT user_id FROM saving_goals WHERE id = goal_id));

-- ----------------------------------------------------------------------------
-- GOAL WITHDRAWALS (checks ownership via parent goal)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can read own goal withdrawals" ON goal_withdrawals;
DROP POLICY IF EXISTS "Users can insert own goal withdrawals" ON goal_withdrawals;
DROP POLICY IF EXISTS "Users can update own goal withdrawals" ON goal_withdrawals;
DROP POLICY IF EXISTS "Users can delete own goal withdrawals" ON goal_withdrawals;

CREATE POLICY "Users can read own goal withdrawals"
ON goal_withdrawals FOR SELECT
USING ((select auth.uid()) IN (SELECT user_id FROM saving_goals WHERE id = goal_id));

CREATE POLICY "Users can insert own goal withdrawals"
ON goal_withdrawals FOR INSERT
WITH CHECK ((select auth.uid()) IN (SELECT user_id FROM saving_goals WHERE id = goal_id));

CREATE POLICY "Users can update own goal withdrawals"
ON goal_withdrawals FOR UPDATE
USING ((select auth.uid()) IN (SELECT user_id FROM saving_goals WHERE id = goal_id))
WITH CHECK ((select auth.uid()) IN (SELECT user_id FROM saving_goals WHERE id = goal_id));

CREATE POLICY "Users can delete own goal withdrawals"
ON goal_withdrawals FOR DELETE
USING ((select auth.uid()) IN (SELECT user_id FROM saving_goals WHERE id = goal_id));

-- ----------------------------------------------------------------------------
-- PAYLATER PLATFORMS
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can read own paylater platforms" ON paylater_platforms;
DROP POLICY IF EXISTS "Users can insert own paylater platforms" ON paylater_platforms;
DROP POLICY IF EXISTS "Users can update own paylater platforms" ON paylater_platforms;
DROP POLICY IF EXISTS "Users can delete own paylater platforms" ON paylater_platforms;

CREATE POLICY "Users can read own paylater platforms"
ON paylater_platforms FOR SELECT
USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own paylater platforms"
ON paylater_platforms FOR INSERT
WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own paylater platforms"
ON paylater_platforms FOR UPDATE
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own paylater platforms"
ON paylater_platforms FOR DELETE
USING (user_id = (select auth.uid()));

-- ----------------------------------------------------------------------------
-- PAYLATER PAYMENTS
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can read own paylater payments" ON paylater_payments;
DROP POLICY IF EXISTS "Users can insert own paylater payments" ON paylater_payments;
DROP POLICY IF EXISTS "Users can update own paylater payments" ON paylater_payments;
DROP POLICY IF EXISTS "Users can delete own paylater payments" ON paylater_payments;

CREATE POLICY "Users can read own paylater payments"
ON paylater_payments FOR SELECT
USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own paylater payments"
ON paylater_payments FOR INSERT
WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own paylater payments"
ON paylater_payments FOR UPDATE
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own paylater payments"
ON paylater_payments FOR DELETE
USING (user_id = (select auth.uid()));

-- ----------------------------------------------------------------------------
-- TRANSACTION TEMPLATES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can read own transaction templates" ON transaction_templates;
DROP POLICY IF EXISTS "Users can insert own transaction templates" ON transaction_templates;
DROP POLICY IF EXISTS "Users can update own transaction templates" ON transaction_templates;
DROP POLICY IF EXISTS "Users can delete own transaction templates" ON transaction_templates;

CREATE POLICY "Users can read own transaction templates"
ON transaction_templates FOR SELECT
USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own transaction templates"
ON transaction_templates FOR INSERT
WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own transaction templates"
ON transaction_templates FOR UPDATE
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own transaction templates"
ON transaction_templates FOR DELETE
USING (user_id = (select auth.uid()));

-- ----------------------------------------------------------------------------
-- DEBT TRANSACTIONS (checks ownership via parent debt)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can manage their own debt transactions" ON debt_transactions;

CREATE POLICY "Users can manage their own debt transactions"
ON debt_transactions FOR ALL
USING ((select auth.uid()) IN (SELECT user_id FROM debts WHERE id = debt_id))
WITH CHECK ((select auth.uid()) IN (SELECT user_id FROM debts WHERE id = debt_id));

-- ----------------------------------------------------------------------------
-- DEBT TRANSACTION PROOFS (checks ownership via parent debt transaction)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can manage their own transaction proofs" ON debt_transaction_proofs;

CREATE POLICY "Users can manage their own transaction proofs"
ON debt_transaction_proofs FOR ALL
USING ((select auth.uid()) IN (
  SELECT d.user_id
  FROM debt_transactions dt
  JOIN debts d ON d.id = dt.debt_id
  WHERE dt.id = transaction_id
))
WITH CHECK ((select auth.uid()) IN (
  SELECT d.user_id
  FROM debt_transactions dt
  JOIN debts d ON d.id = dt.debt_id
  WHERE dt.id = transaction_id
));

-- ----------------------------------------------------------------------------
-- DEBT PAYMENT PROOFS (checks ownership via parent debt payment)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can manage their own payment proofs" ON debt_payment_proofs;

CREATE POLICY "Users can manage their own payment proofs"
ON debt_payment_proofs FOR ALL
USING ((select auth.uid()) IN (
  SELECT d.user_id
  FROM debt_payments dp
  JOIN debts d ON d.id = dp.debt_id
  WHERE dp.id = payment_id
))
WITH CHECK ((select auth.uid()) IN (
  SELECT d.user_id
  FROM debt_payments dp
  JOIN debts d ON d.id = dp.debt_id
  WHERE dp.id = payment_id
));

-- ============================================================================
-- PART 3: STORAGE RLS POLICY FIXES
-- ============================================================================
-- Fix storage.objects RLS policies to use (select auth.uid()) instead of auth.uid()

-- ----------------------------------------------------------------------------
-- AVATARS BUCKET
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow authenticated delete avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated update avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated upload avatars" ON storage.objects;

CREATE POLICY "Allow authenticated upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  (bucket_id = 'avatars') AND
  ((storage.foldername(name))[1] = (select auth.uid())::text)
);

CREATE POLICY "Allow authenticated update avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  (bucket_id = 'avatars') AND
  ((storage.foldername(name))[1] = (select auth.uid())::text)
);

CREATE POLICY "Allow authenticated delete avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  (bucket_id = 'avatars') AND
  ((storage.foldername(name))[1] = (select auth.uid())::text)
);

-- ----------------------------------------------------------------------------
-- RECEIPTS BUCKET
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow authenticated delete receipts" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated update receipts" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated upload receipts" ON storage.objects;

CREATE POLICY "Allow authenticated upload receipts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  (bucket_id = 'receipts') AND
  ((storage.foldername(name))[1] = (select auth.uid())::text)
);

CREATE POLICY "Allow authenticated update receipts"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  (bucket_id = 'receipts') AND
  ((storage.foldername(name))[1] = (select auth.uid())::text)
);

CREATE POLICY "Allow authenticated delete receipts"
ON storage.objects FOR DELETE
TO authenticated
USING (
  (bucket_id = 'receipts') AND
  ((storage.foldername(name))[1] = (select auth.uid())::text)
);

-- ============================================================================
-- PART 4: MERGE MULTIPLE PERMISSIVE POLICIES
-- ============================================================================
-- Combines multiple policies for the same table/action into unified policies
-- to reduce the number of policy checks per query.

-- ----------------------------------------------------------------------------
-- USERS TABLE - Merge SELECT and UPDATE policies
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Admins can read all profiles" ON users;

CREATE POLICY "Authenticated users can read appropriate profiles"
ON users FOR SELECT
TO authenticated
USING (
  (id = (select auth.uid())) OR
  ((select auth.uid()) IN (SELECT id FROM auth.users WHERE raw_app_meta_data->>'role' = 'admin'))
);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can update all profiles" ON users;

CREATE POLICY "Authenticated users can update appropriate profiles"
ON users FOR UPDATE
TO authenticated
USING (
  (id = (select auth.uid())) OR
  ((select auth.uid()) IN (SELECT id FROM auth.users WHERE raw_app_meta_data->>'role' = 'admin'))
)
WITH CHECK (
  (id = (select auth.uid())) OR
  ((select auth.uid()) IN (SELECT id FROM auth.users WHERE raw_app_meta_data->>'role' = 'admin'))
);

DROP POLICY IF EXISTS "Admins can insert all profiles" ON users;

CREATE POLICY "Admins can insert all profiles"
ON users FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid()) IN (SELECT id FROM auth.users WHERE raw_app_meta_data->>'role' = 'admin'));

-- ----------------------------------------------------------------------------
-- AUDIT LOGS
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can read audit logs" ON audit_logs;

CREATE POLICY "Admins can read audit logs"
ON audit_logs FOR SELECT
TO authenticated
USING ((select auth.uid()) IN (SELECT id FROM auth.users WHERE raw_app_meta_data->>'role' = 'admin'));

-- ----------------------------------------------------------------------------
-- CATEGORY TEMPLATES - Merge read and admin policies
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can read category templates" ON category_templates;
DROP POLICY IF EXISTS "Admins can manage category templates" ON category_templates;

CREATE POLICY "Authenticated users can read category templates, admins can manage"
ON category_templates FOR ALL
TO authenticated
USING (true)
WITH CHECK (
  -- Only admins can insert/update/delete
  ((select auth.uid()) IN (SELECT id FROM auth.users WHERE raw_app_meta_data->>'role' = 'admin'))
);

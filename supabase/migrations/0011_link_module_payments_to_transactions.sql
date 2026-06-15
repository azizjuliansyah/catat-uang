-- Migration 0011: Link module payments to transactions table
-- Adds transaction_id to debt_payments, goal_topups, goal_withdrawals, paylater_payments
-- so these payments appear in the unified transaction flow.
-- Triggers are made backwards-compatible: old rows (transaction_id IS NULL) still
-- manage wallet balance themselves; new rows defer to the transactions trigger.

-- 1. Add transaction_id reference columns (nullable, cascade on transaction delete)
ALTER TABLE public.debt_payments
  ADD COLUMN IF NOT EXISTS transaction_id uuid REFERENCES public.transactions(id) ON DELETE CASCADE;

ALTER TABLE public.goal_topups
  ADD COLUMN IF NOT EXISTS transaction_id uuid REFERENCES public.transactions(id) ON DELETE CASCADE;

ALTER TABLE public.goal_withdrawals
  ADD COLUMN IF NOT EXISTS transaction_id uuid REFERENCES public.transactions(id) ON DELETE CASCADE;

ALTER TABLE public.paylater_payments
  ADD COLUMN IF NOT EXISTS transaction_id uuid REFERENCES public.transactions(id) ON DELETE CASCADE;

-- 2. Update debt_payments trigger — skip wallet update when transaction_id is set
CREATE OR REPLACE FUNCTION public.update_wallet_balance_from_debt_payment()
RETURNS trigger AS $$
DECLARE
  v_debt_type text;
  v_debt_id uuid;
BEGIN
  v_debt_id := COALESCE(new.debt_id, old.debt_id);
  SELECT type INTO v_debt_type FROM public.debts WHERE id = v_debt_id;

  IF (TG_OP = 'INSERT') THEN
    IF new.transaction_id IS NULL THEN
      IF v_debt_type = 'lend' THEN
        UPDATE public.wallets SET balance = balance + new.amount WHERE id = new.wallet_id;
      ELSE
        UPDATE public.wallets SET balance = balance - new.amount WHERE id = new.wallet_id;
      END IF;
    END IF;
    UPDATE public.debts SET paid_amount = paid_amount + new.amount WHERE id = new.debt_id;

  ELSIF (TG_OP = 'DELETE') THEN
    IF old.transaction_id IS NULL THEN
      IF v_debt_type = 'lend' THEN
        UPDATE public.wallets SET balance = balance - old.amount WHERE id = old.wallet_id;
      ELSE
        UPDATE public.wallets SET balance = balance + old.amount WHERE id = old.wallet_id;
      END IF;
    END IF;
    UPDATE public.debts SET paid_amount = paid_amount - old.amount WHERE id = old.debt_id;

  ELSIF (TG_OP = 'UPDATE') THEN
    IF old.transaction_id IS NULL THEN
      IF v_debt_type = 'lend' THEN
        UPDATE public.wallets SET balance = balance - old.amount WHERE id = old.wallet_id;
      ELSE
        UPDATE public.wallets SET balance = balance + old.amount WHERE id = old.wallet_id;
      END IF;
    END IF;
    UPDATE public.debts SET paid_amount = paid_amount - old.amount WHERE id = old.debt_id;
    IF new.transaction_id IS NULL THEN
      IF v_debt_type = 'lend' THEN
        UPDATE public.wallets SET balance = balance + new.amount WHERE id = new.wallet_id;
      ELSE
        UPDATE public.wallets SET balance = balance - new.amount WHERE id = new.wallet_id;
      END IF;
    END IF;
    UPDATE public.debts SET paid_amount = paid_amount + new.amount WHERE id = new.debt_id;
  END IF;

  UPDATE public.debts
  SET status = CASE WHEN paid_amount >= total_amount THEN 'paid'::text ELSE 'unpaid'::text END
  WHERE id = v_debt_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Update goal_topups trigger — skip wallet update when transaction_id is set
CREATE OR REPLACE FUNCTION public.update_wallet_balance_from_goal_topup()
RETURNS trigger AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    IF new.transaction_id IS NULL THEN
      UPDATE public.wallets SET balance = balance - new.amount WHERE id = new.wallet_id;
    END IF;
    UPDATE public.saving_goals SET current_amount = current_amount + new.amount WHERE id = new.goal_id;

  ELSIF (TG_OP = 'DELETE') THEN
    IF old.transaction_id IS NULL THEN
      UPDATE public.wallets SET balance = balance + old.amount WHERE id = old.wallet_id;
    END IF;
    UPDATE public.saving_goals SET current_amount = current_amount - old.amount WHERE id = old.goal_id;

  ELSIF (TG_OP = 'UPDATE') THEN
    IF old.transaction_id IS NULL THEN
      UPDATE public.wallets SET balance = balance + old.amount WHERE id = old.wallet_id;
    END IF;
    UPDATE public.saving_goals SET current_amount = current_amount - old.amount WHERE id = old.goal_id;
    IF new.transaction_id IS NULL THEN
      UPDATE public.wallets SET balance = balance - new.amount WHERE id = new.wallet_id;
    END IF;
    UPDATE public.saving_goals SET current_amount = current_amount + new.amount WHERE id = new.goal_id;
  END IF;

  UPDATE public.saving_goals
  SET status = CASE
    WHEN current_amount >= target_amount THEN 'achieved'::text
    ELSE 'ongoing'::text
  END
  WHERE id = COALESCE(new.goal_id, old.goal_id);

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Update goal_withdrawals trigger — skip wallet update when transaction_id is set
CREATE OR REPLACE FUNCTION public.update_wallet_balance_from_goal_withdrawal()
RETURNS trigger AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    IF new.transaction_id IS NULL THEN
      UPDATE public.wallets SET balance = balance + new.amount WHERE id = new.wallet_id;
    END IF;
    UPDATE public.saving_goals SET current_amount = current_amount - new.amount WHERE id = new.goal_id;

  ELSIF (TG_OP = 'DELETE') THEN
    IF old.transaction_id IS NULL THEN
      UPDATE public.wallets SET balance = balance - old.amount WHERE id = old.wallet_id;
    END IF;
    UPDATE public.saving_goals SET current_amount = current_amount + old.amount WHERE id = old.goal_id;

  ELSIF (TG_OP = 'UPDATE') THEN
    IF old.transaction_id IS NULL THEN
      UPDATE public.wallets SET balance = balance - old.amount WHERE id = old.wallet_id;
    END IF;
    UPDATE public.saving_goals SET current_amount = current_amount + old.amount WHERE id = old.goal_id;
    IF new.transaction_id IS NULL THEN
      UPDATE public.wallets SET balance = balance + new.amount WHERE id = new.wallet_id;
    END IF;
    UPDATE public.saving_goals SET current_amount = current_amount - new.amount WHERE id = new.goal_id;
  END IF;

  UPDATE public.saving_goals
  SET status = CASE
    WHEN current_amount <= 0 THEN 'withdrawn'::text
    WHEN current_amount >= target_amount THEN 'achieved'::text
    ELSE 'ongoing'::text
  END
  WHERE id = COALESCE(new.goal_id, old.goal_id);

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Update paylater_payments trigger — skip wallet update when transaction_id is set
CREATE OR REPLACE FUNCTION public.update_balance_from_paylater_payment()
RETURNS trigger AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    IF new.transaction_id IS NULL THEN
      UPDATE public.wallets SET balance = balance - new.amount WHERE id = new.wallet_id;
    END IF;
    UPDATE public.paylater_platforms SET balance = balance - new.amount WHERE id = new.paylater_id;

  ELSIF (TG_OP = 'DELETE') THEN
    IF old.transaction_id IS NULL THEN
      UPDATE public.wallets SET balance = balance + old.amount WHERE id = old.wallet_id;
    END IF;
    UPDATE public.paylater_platforms SET balance = balance + old.amount WHERE id = old.paylater_id;

  ELSIF (TG_OP = 'UPDATE') THEN
    IF old.transaction_id IS NULL THEN
      UPDATE public.wallets SET balance = balance + old.amount WHERE id = old.wallet_id;
    END IF;
    UPDATE public.paylater_platforms SET balance = balance + old.amount WHERE id = old.paylater_id;
    IF new.transaction_id IS NULL THEN
      UPDATE public.wallets SET balance = balance - new.amount WHERE id = new.wallet_id;
    END IF;
    UPDATE public.paylater_platforms SET balance = balance - new.amount WHERE id = new.paylater_id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

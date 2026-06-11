-- Migration: Change date columns to timestamptz for more precision

-- 1. transactions
ALTER TABLE transactions ALTER COLUMN transaction_date TYPE timestamptz USING transaction_date::timestamptz;
ALTER TABLE transactions ALTER COLUMN transaction_date SET DEFAULT now();

-- 2. transfers
ALTER TABLE transfers ALTER COLUMN transfer_date TYPE timestamptz USING transfer_date::timestamptz;
ALTER TABLE transfers ALTER COLUMN transfer_date SET DEFAULT now();

-- 3. debts
ALTER TABLE debts ALTER COLUMN due_date TYPE timestamptz USING due_date::timestamptz;

-- 4. debt_payments
ALTER TABLE debt_payments ALTER COLUMN payment_date TYPE timestamptz USING payment_date::timestamptz;
ALTER TABLE debt_payments ALTER COLUMN payment_date SET DEFAULT now();

-- 5. saving_goals
ALTER TABLE saving_goals ALTER COLUMN target_date TYPE timestamptz USING target_date::timestamptz;

-- 6. goal_topups
ALTER TABLE goal_topups ALTER COLUMN topup_date TYPE timestamptz USING topup_date::timestamptz;
ALTER TABLE goal_topups ALTER COLUMN topup_date SET DEFAULT now();

-- 7. goal_withdrawals
ALTER TABLE goal_withdrawals ALTER COLUMN withdrawal_date TYPE timestamptz USING withdrawal_date::timestamptz;
ALTER TABLE goal_withdrawals ALTER COLUMN withdrawal_date SET DEFAULT now();

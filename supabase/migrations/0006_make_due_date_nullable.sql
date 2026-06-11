-- Migration: Make debts.due_date nullable / optional

ALTER TABLE public.debts ALTER COLUMN due_date DROP NOT NULL;

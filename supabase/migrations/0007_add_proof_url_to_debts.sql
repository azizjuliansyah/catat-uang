-- Migration: Add proof_url column to debts and debt_payments tables

ALTER TABLE public.debts ADD COLUMN proof_url text;
ALTER TABLE public.debt_payments ADD COLUMN proof_url text;

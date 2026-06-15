-- Add target_type and target_id columns to audit_logs
ALTER TABLE public.audit_logs
ADD COLUMN target_type text,
ADD COLUMN target_id uuid;

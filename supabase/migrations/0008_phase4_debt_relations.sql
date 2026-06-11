-- 1. Create debt_transactions table
CREATE TABLE IF NOT EXISTS public.debt_transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    debt_id uuid REFERENCES public.debts(id) ON DELETE CASCADE NOT NULL,
    amount numeric NOT NULL CHECK (amount > 0::numeric),
    due_date timestamp with time zone,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 2. Create debt_transaction_proofs and debt_payment_proofs tables
CREATE TABLE IF NOT EXISTS public.debt_transaction_proofs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id uuid REFERENCES public.debt_transactions(id) ON DELETE CASCADE NOT NULL,
    proof_url text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.debt_payment_proofs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id uuid REFERENCES public.debt_payments(id) ON DELETE CASCADE NOT NULL,
    proof_url text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- 3. Enable RLS on new tables
ALTER TABLE public.debt_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debt_transaction_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debt_payment_proofs ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'debt_transactions' AND policyname = 'Users can manage their own debt transactions'
    ) THEN
        CREATE POLICY "Users can manage their own debt transactions"
            ON public.debt_transactions
            USING (EXISTS (
                SELECT 1 FROM public.debts d
                WHERE d.id = debt_transactions.debt_id AND d.user_id = auth.uid()
            ))
            WITH CHECK (EXISTS (
                SELECT 1 FROM public.debts d
                WHERE d.id = debt_transactions.debt_id AND d.user_id = auth.uid()
            ));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'debt_transaction_proofs' AND policyname = 'Users can manage their own transaction proofs'
    ) THEN
        CREATE POLICY "Users can manage their own transaction proofs"
            ON public.debt_transaction_proofs
            USING (EXISTS (
                SELECT 1 FROM public.debt_transactions t
                JOIN public.debts d ON d.id = t.debt_id
                WHERE t.id = debt_transaction_proofs.transaction_id AND d.user_id = auth.uid()
            ))
            WITH CHECK (EXISTS (
                SELECT 1 FROM public.debt_transactions t
                JOIN public.debts d ON d.id = t.debt_id
                WHERE t.id = debt_transaction_proofs.transaction_id AND d.user_id = auth.uid()
            ));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'debt_payment_proofs' AND policyname = 'Users can manage their own payment proofs'
    ) THEN
        CREATE POLICY "Users can manage their own payment proofs"
            ON public.debt_payment_proofs
            USING (EXISTS (
                SELECT 1 FROM public.debt_payments p
                JOIN public.debts d ON d.id = p.debt_id
                WHERE p.id = debt_payment_proofs.payment_id AND d.user_id = auth.uid()
            ))
            WITH CHECK (EXISTS (
                SELECT 1 FROM public.debt_payments p
                JOIN public.debts d ON d.id = p.debt_id
                WHERE p.id = debt_payment_proofs.payment_id AND d.user_id = auth.uid()
            ));
    END IF;
END $$;

-- 5. Migrate existing data to new schema
DO $$
DECLARE
    r RECORD;
    t_id uuid;
BEGIN
    -- Check if debts table still has legacy columns before migrating
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'debts' AND column_name = 'due_date'
    ) THEN
        FOR r IN SELECT * FROM public.debts LOOP
            INSERT INTO public.debt_transactions (debt_id, amount, due_date, description, created_at, updated_at)
            VALUES (r.id, r.total_amount, r.due_date, r.description, r.created_at, r.updated_at)
            RETURNING id INTO t_id;

            IF r.proof_url IS NOT NULL AND r.proof_url <> '' THEN
                INSERT INTO public.debt_transaction_proofs (transaction_id, proof_url, created_at)
                VALUES (t_id, r.proof_url, r.created_at);
            END IF;
        END LOOP;
    END IF;

    -- Check if debt_payments table still has legacy proof_url before migrating
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'debt_payments' AND column_name = 'proof_url'
    ) THEN
        FOR r IN SELECT * FROM public.debt_payments WHERE proof_url IS NOT NULL AND proof_url <> '' LOOP
            INSERT INTO public.debt_payment_proofs (payment_id, proof_url, created_at)
            VALUES (r.id, r.proof_url, r.created_at);
        END LOOP;
    END IF;
END $$;

-- 6. Modify check constraints on debts table
ALTER TABLE public.debts DROP CONSTRAINT IF EXISTS debts_total_amount_check;
ALTER TABLE public.debts ALTER COLUMN total_amount SET DEFAULT 0.00;
ALTER TABLE public.debts ADD CONSTRAINT debts_total_amount_check CHECK (total_amount >= 0::numeric);

-- 7. Drop legacy columns
ALTER TABLE public.debts DROP COLUMN IF EXISTS proof_url;
ALTER TABLE public.debts DROP COLUMN IF EXISTS due_date;
ALTER TABLE public.debts DROP COLUMN IF EXISTS description;
ALTER TABLE public.debt_payments DROP COLUMN IF EXISTS proof_url;

-- 8. Create trigger to update debts.total_amount based on debt_transactions
CREATE OR REPLACE FUNCTION public.update_debt_total_amount()
RETURNS trigger AS $$
DECLARE
  v_debt_id uuid;
  v_total numeric;
  v_paid numeric;
BEGIN
  v_debt_id := COALESCE(NEW.debt_id, OLD.debt_id);
  
  -- Calculate total amount from transactions
  SELECT COALESCE(SUM(amount), 0.00) INTO v_total
  FROM public.debt_transactions
  WHERE debt_id = v_debt_id;
  
  -- Get paid amount
  SELECT paid_amount INTO v_paid
  FROM public.debts
  WHERE id = v_debt_id;
  
  -- Update parent debt
  UPDATE public.debts
  SET 
    total_amount = v_total,
    status = CASE WHEN v_paid >= v_total THEN 'paid'::text ELSE 'unpaid'::text END,
    updated_at = NOW()
  where id = v_debt_id;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_debt_transaction_modified ON public.debt_transactions;
CREATE TRIGGER on_debt_transaction_modified
  AFTER INSERT OR UPDATE OR DELETE ON public.debt_transactions
  FOR EACH ROW EXECUTE PROCEDURE public.update_debt_total_amount();

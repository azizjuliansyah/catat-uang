-- Create Wishlists Table
CREATE TABLE public.wishlists (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  qty integer NOT NULL DEFAULT 1 CHECK (qty > 0),
  price numeric(15, 2) NOT NULL DEFAULT 0.00 CHECK (price >= 0),
  target_date timestamp with time zone,
  description text,
  is_purchased boolean NOT NULL DEFAULT false,
  transaction_id uuid REFERENCES public.transactions(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can view their own wishlists"
  ON public.wishlists FOR SELECT TO authenticated
  USING ( (select auth.uid()) = user_id );

CREATE POLICY "Users can insert their own wishlists"
  ON public.wishlists FOR INSERT TO authenticated
  WITH CHECK ( (select auth.uid()) = user_id );

CREATE POLICY "Users can update their own wishlists"
  ON public.wishlists FOR UPDATE TO authenticated
  USING ( (select auth.uid()) = user_id )
  WITH CHECK ( (select auth.uid()) = user_id );

CREATE POLICY "Users can delete their own wishlists"
  ON public.wishlists FOR DELETE TO authenticated
  USING ( (select auth.uid()) = user_id );

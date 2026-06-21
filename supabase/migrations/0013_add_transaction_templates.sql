-- Migration: Add Transaction Templates Table

create table public.transaction_templates (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  amount numeric(15, 2) not null check (amount > 0),
  type text not null check (type in ('income', 'expense')),
  category_id uuid references public.categories(id) on delete set null,
  wallet_id uuid references public.wallets(id) on delete cascade,
  paylater_id uuid references public.paylater_platforms(id) on delete cascade,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint check_template_wallet_or_paylater check (
    (wallet_id is not null and paylater_id is null) or 
    (wallet_id is null and paylater_id is not null)
  )
);

-- Enable RLS
alter table public.transaction_templates enable row level security;

-- Create RLS Policies
create policy "Users can read own transaction templates"
  on public.transaction_templates for select to authenticated
  using (user_id = auth.uid());

create policy "Users can insert own transaction templates"
  on public.transaction_templates for insert to authenticated
  with check (user_id = auth.uid());

create policy "Users can update own transaction templates"
  on public.transaction_templates for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete own transaction templates"
  on public.transaction_templates for delete to authenticated
  using (user_id = auth.uid());

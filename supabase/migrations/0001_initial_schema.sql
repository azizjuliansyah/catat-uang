-- CatatUang Initial Database Schema Migration

-- 1. Profile Table (Extends Supabase Auth Users)
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  role text not null check (role in ('admin', 'user')) default 'user',
  status text not null check (status in ('active', 'suspended')) default 'active',
  name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Audit Logs Table (For admin operations)
create table public.audit_logs (
  id uuid default gen_random_uuid() primary key,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- 3. Wallets Table
create table public.wallets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  balance numeric(15, 2) not null default 0.00,
  initial_balance numeric(15, 2) not null default 0.00,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. Categories Table
create table public.categories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  type text not null check (type in ('income', 'expense')),
  icon text not null,
  color text not null,
  created_at timestamptz not null default now()
);

-- 5. Transactions Table
create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  wallet_id uuid references public.wallets(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete set null,
  amount numeric(15, 2) not null check (amount > 0),
  type text not null check (type in ('income', 'expense')),
  description text,
  transaction_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 6. Transfers Table
create table public.transfers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  from_wallet_id uuid references public.wallets(id) on delete cascade not null,
  to_wallet_id uuid references public.wallets(id) on delete cascade not null,
  amount numeric(15, 2) not null check (amount > 0),
  description text,
  transfer_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 7. Debts Table
create table public.debts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  total_amount numeric(15, 2) not null check (total_amount > 0),
  paid_amount numeric(15, 2) not null default 0.00 check (paid_amount >= 0),
  due_date date not null,
  status text not null check (status in ('unpaid', 'paid')) default 'unpaid',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 8. Debt Payments Table
create table public.debt_payments (
  id uuid default gen_random_uuid() primary key,
  debt_id uuid references public.debts(id) on delete cascade not null,
  wallet_id uuid references public.wallets(id) on delete cascade not null,
  amount numeric(15, 2) not null check (amount > 0),
  payment_date date not null default current_date,
  created_at timestamptz not null default now()
);

-- 9. Saving Goals Table
create table public.saving_goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  target_amount numeric(15, 2) not null check (target_amount > 0),
  current_amount numeric(15, 2) not null default 0.00 check (current_amount >= 0),
  target_date date not null,
  status text not null check (status in ('ongoing', 'achieved')) default 'ongoing',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 10. Goal Topups Table
create table public.goal_topups (
  id uuid default gen_random_uuid() primary key,
  goal_id uuid references public.saving_goals(id) on delete cascade not null,
  wallet_id uuid references public.wallets(id) on delete cascade not null,
  amount numeric(15, 2) not null check (amount > 0),
  topup_date date not null default current_date,
  created_at timestamptz not null default now()
);

--------------------------------------------------------------------------------
-- TRIGGERS & FUNCTIONS
--------------------------------------------------------------------------------

-- Trigger 1: Set default metadata in auth.users app_metadata on insert
create or replace function public.set_new_user_metadata()
returns trigger as $$
begin
  new.raw_app_meta_data := coalesce(new.raw_app_meta_data, '{}'::jsonb) || jsonb_build_object(
    'role', coalesce(new.raw_user_meta_data->>'role', 'user'),
    'status', coalesce(new.raw_user_meta_data->>'status', 'active')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created_metadata
  before insert on auth.users
  for each row execute procedure public.set_new_user_metadata();

-- Trigger 2: Sync profile creation to public.users & Seed default categories
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, name, avatar_url, role, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.email),
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_user_meta_data->>'role', 'user'),
    coalesce(new.raw_user_meta_data->>'status', 'active')
  );

  -- Seed default categories for the user
  insert into public.categories (user_id, name, type, icon, color)
  values
    (new.id, 'Gaji', 'income', 'Briefcase', '#10B981'),
    (new.id, 'Investasi', 'income', 'TrendingUp', '#3B82F6'),
    (new.id, 'Makanan & Minuman', 'expense', 'Utensils', '#EF4444'),
    (new.id, 'Transportasi', 'expense', 'Car', '#F59E0B'),
    (new.id, 'Belanja', 'expense', 'ShoppingBag', '#EC4899'),
    (new.id, 'Utilitas & Tagihan', 'expense', 'FileText', '#8B5CF6'),
    (new.id, 'Hiburan', 'expense', 'Film', '#6366F1'),
    (new.id, 'Lainnya', 'expense', 'HelpCircle', '#6B7280');

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger 3: Sync role/status updates from public.users to auth.users raw_app_meta_data
create or replace function public.sync_user_metadata_to_auth()
returns trigger as $$
begin
  update auth.users
  set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object(
    'role', new.role,
    'status', new.status
  )
  where id = new.id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_public_user_updated
  after update of role, status on public.users
  for each row execute procedure public.sync_user_metadata_to_auth();

-- Trigger 4: Initialize wallet balance with initial_balance
create or replace function public.initialize_wallet_balance()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    new.balance := coalesce(new.initial_balance, 0.00);
  elsif (TG_OP = 'UPDATE') then
    new.balance := old.balance - coalesce(old.initial_balance, 0.00) + coalesce(new.initial_balance, 0.00);
  end if;
  return new;
end;
$$ language plpgsql;

create trigger on_wallet_created_or_updated
  before insert or update of initial_balance on public.wallets
  for each row execute procedure public.initialize_wallet_balance();

-- Trigger 5: Wallet balance adjustment from Transactions
create or replace function public.update_wallet_balance_from_transaction()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    if (new.type = 'income') then
      update public.wallets set balance = balance + new.amount where id = new.wallet_id;
    else
      update public.wallets set balance = balance - new.amount where id = new.wallet_id;
    end if;
  elsif (TG_OP = 'DELETE') then
    if (old.type = 'income') then
      update public.wallets set balance = balance - old.amount where id = old.wallet_id;
    else
      update public.wallets set balance = balance + old.amount where id = old.wallet_id;
    end if;
  elsif (TG_OP = 'UPDATE') then
    if (old.type = 'income') then
      update public.wallets set balance = balance - old.amount where id = old.wallet_id;
    else
      update public.wallets set balance = balance + old.amount where id = old.wallet_id;
    end if;
    if (new.type = 'income') then
      update public.wallets set balance = balance + new.amount where id = new.wallet_id;
    else
      update public.wallets set balance = balance - new.amount where id = new.wallet_id;
    end if;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create trigger on_transaction_modified
  after insert or update or delete on public.transactions
  for each row execute procedure public.update_wallet_balance_from_transaction();

-- Trigger 6: Wallet balance adjustment from Transfers
create or replace function public.update_wallet_balance_from_transfer()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update public.wallets set balance = balance - new.amount where id = new.from_wallet_id;
    update public.wallets set balance = balance + new.amount where id = new.to_wallet_id;
  elsif (TG_OP = 'DELETE') then
    update public.wallets set balance = balance + old.amount where id = old.from_wallet_id;
    update public.wallets set balance = balance - old.amount where id = old.to_wallet_id;
  elsif (TG_OP = 'UPDATE') then
    update public.wallets set balance = balance + old.amount where id = old.from_wallet_id;
    update public.wallets set balance = balance - old.amount where id = old.to_wallet_id;
    update public.wallets set balance = balance - new.amount where id = new.from_wallet_id;
    update public.wallets set balance = balance + new.amount where id = new.to_wallet_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create trigger on_transfer_modified
  after insert or update or delete on public.transfers
  for each row execute procedure public.update_wallet_balance_from_transfer();

-- Trigger 7: Wallet balance adjustment & paid_amount update from Debt Payments
create or replace function public.update_wallet_balance_from_debt_payment()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update public.wallets set balance = balance - new.amount where id = new.wallet_id;
    update public.debts set paid_amount = paid_amount + new.amount where id = new.debt_id;
  elsif (TG_OP = 'DELETE') then
    update public.wallets set balance = balance + old.amount where id = old.wallet_id;
    update public.debts set paid_amount = paid_amount - old.amount where id = old.debt_id;
  elsif (TG_OP = 'UPDATE') then
    update public.wallets set balance = balance + old.amount where id = old.wallet_id;
    update public.debts set paid_amount = paid_amount - old.amount where id = old.debt_id;
    update public.wallets set balance = balance - new.amount where id = new.wallet_id;
    update public.debts set paid_amount = paid_amount + new.amount where id = new.debt_id;
  end if;

  update public.debts
  set status = case when paid_amount >= total_amount then 'paid'::text else 'unpaid'::text end
  where id = coalesce(new.debt_id, old.debt_id);

  return null;
end;
$$ language plpgsql security definer;

create trigger on_debt_payment_modified
  after insert or update or delete on public.debt_payments
  for each row execute procedure public.update_wallet_balance_from_debt_payment();

-- Trigger 8: Wallet balance adjustment & current_amount update from Goal Topups
create or replace function public.update_wallet_balance_from_goal_topup()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update public.wallets set balance = balance - new.amount where id = new.wallet_id;
    update public.saving_goals set current_amount = current_amount + new.amount where id = new.goal_id;
  elsif (TG_OP = 'DELETE') then
    update public.wallets set balance = balance + old.amount where id = old.wallet_id;
    update public.saving_goals set current_amount = current_amount - old.amount where id = old.goal_id;
  elsif (TG_OP = 'UPDATE') then
    update public.wallets set balance = balance + old.amount where id = old.wallet_id;
    update public.saving_goals set current_amount = current_amount - old.amount where id = old.goal_id;
    update public.wallets set balance = balance - new.amount where id = new.wallet_id;
    update public.saving_goals set current_amount = current_amount + new.amount where id = new.goal_id;
  end if;

  update public.saving_goals
  set status = case when current_amount >= target_amount then 'achieved'::text else 'ongoing'::text end
  where id = coalesce(new.goal_id, old.goal_id);

  return null;
end;
$$ language plpgsql security definer;

create trigger on_goal_topup_modified
  after insert or update or delete on public.goal_topups
  for each row execute procedure public.update_wallet_balance_from_goal_topup();

--------------------------------------------------------------------------------
-- ROW-LEVEL SECURITY (RLS) POLICIES
--------------------------------------------------------------------------------

-- Enable RLS on every table
alter table public.users enable row level security;
alter table public.audit_logs enable row level security;
alter table public.wallets enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.transfers enable row level security;
alter table public.debts enable row level security;
alter table public.debt_payments enable row level security;
alter table public.saving_goals enable row level security;
alter table public.goal_topups enable row level security;

-- 1. Users policies
create policy "Users can read own profile"
  on public.users for select to authenticated
  using (id = auth.uid());

create policy "Users can update own profile"
  on public.users for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "Admins can read all profiles"
  on public.users for select to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can update all profiles"
  on public.users for update to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can insert all profiles"
  on public.users for insert to authenticated
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- 2. Audit Logs policies
create policy "Admins can read audit logs"
  on public.audit_logs for select to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- 3. Wallets policies
create policy "Users can read own wallets"
  on public.wallets for select to authenticated
  using (user_id = auth.uid());

create policy "Users can insert own wallets"
  on public.wallets for insert to authenticated
  with check (user_id = auth.uid());

create policy "Users can update own wallets"
  on public.wallets for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete own wallets"
  on public.wallets for delete to authenticated
  using (user_id = auth.uid());

-- 4. Categories policies
create policy "Users can read own categories"
  on public.categories for select to authenticated
  using (user_id = auth.uid());

create policy "Users can insert own categories"
  on public.categories for insert to authenticated
  with check (user_id = auth.uid());

create policy "Users can update own categories"
  on public.categories for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete own categories"
  on public.categories for delete to authenticated
  using (user_id = auth.uid());

-- 5. Transactions policies
create policy "Users can read own transactions"
  on public.transactions for select to authenticated
  using (user_id = auth.uid());

create policy "Users can insert own transactions"
  on public.transactions for insert to authenticated
  with check (user_id = auth.uid());

create policy "Users can update own transactions"
  on public.transactions for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete own transactions"
  on public.transactions for delete to authenticated
  using (user_id = auth.uid());

-- 6. Transfers policies
create policy "Users can read own transfers"
  on public.transfers for select to authenticated
  using (user_id = auth.uid());

create policy "Users can insert own transfers"
  on public.transfers for insert to authenticated
  with check (user_id = auth.uid());

create policy "Users can update own transfers"
  on public.transfers for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete own transfers"
  on public.transfers for delete to authenticated
  using (user_id = auth.uid());

-- 7. Debts policies
create policy "Users can read own debts"
  on public.debts for select to authenticated
  using (user_id = auth.uid());

create policy "Users can insert own debts"
  on public.debts for insert to authenticated
  with check (user_id = auth.uid());

create policy "Users can update own debts"
  on public.debts for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete own debts"
  on public.debts for delete to authenticated
  using (user_id = auth.uid());

-- 8. Debt Payments policies
create policy "Users can read own debt payments"
  on public.debt_payments for select to authenticated
  using (
    exists (
      select 1 from public.debts
      where debts.id = debt_payments.debt_id
      and debts.user_id = auth.uid()
    )
  );

create policy "Users can insert own debt payments"
  on public.debt_payments for insert to authenticated
  with check (
    exists (
      select 1 from public.debts
      where debts.id = debt_payments.debt_id
      and debts.user_id = auth.uid()
    )
  );

create policy "Users can update own debt payments"
  on public.debt_payments for update to authenticated
  using (
    exists (
      select 1 from public.debts
      where debts.id = debt_payments.debt_id
      and debts.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.debts
      where debts.id = debt_payments.debt_id
      and debts.user_id = auth.uid()
    )
  );

create policy "Users can delete own debt payments"
  on public.debt_payments for delete to authenticated
  using (
    exists (
      select 1 from public.debts
      where debts.id = debt_payments.debt_id
      and debts.user_id = auth.uid()
    )
  );

-- 9. Saving Goals policies
create policy "Users can read own saving goals"
  on public.saving_goals for select to authenticated
  using (user_id = auth.uid());

create policy "Users can insert own saving goals"
  on public.saving_goals for insert to authenticated
  with check (user_id = auth.uid());

create policy "Users can update own saving goals"
  on public.saving_goals for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete own saving goals"
  on public.saving_goals for delete to authenticated
  using (user_id = auth.uid());

-- 10. Goal Topups policies
create policy "Users can read own goal topups"
  on public.goal_topups for select to authenticated
  using (
    exists (
      select 1 from public.saving_goals
      where saving_goals.id = goal_topups.goal_id
      and saving_goals.user_id = auth.uid()
    )
  );

create policy "Users can insert own goal topups"
  on public.goal_topups for insert to authenticated
  with check (
    exists (
      select 1 from public.saving_goals
      where saving_goals.id = goal_topups.goal_id
      and saving_goals.user_id = auth.uid()
    )
  );

create policy "Users can update own goal topups"
  on public.goal_topups for update to authenticated
  using (
    exists (
      select 1 from public.saving_goals
      where saving_goals.id = goal_topups.goal_id
      and saving_goals.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.saving_goals
      where saving_goals.id = goal_topups.goal_id
      and saving_goals.user_id = auth.uid()
    )
  );

create policy "Users can delete own goal topups"
  on public.goal_topups for delete to authenticated
  using (
    exists (
      select 1 from public.saving_goals
      where saving_goals.id = goal_topups.goal_id
      and saving_goals.user_id = auth.uid()
    )
  );

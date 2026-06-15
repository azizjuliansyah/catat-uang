-- CatatUang Paylater Schema Migration

-- 1. Create Paylater Platforms Table
create table public.paylater_platforms (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  limit_amount numeric(15, 2) not null check (limit_amount >= 0.00) default 0.00,
  balance numeric(15, 2) not null default 0.00, -- outstanding debt / usage
  billing_cycle_date integer not null check (billing_cycle_date >= 1 and billing_cycle_date <= 31) default 5,
  due_date_offset integer not null check (due_date_offset >= 1 and due_date_offset <= 31) default 15,
  icon text not null default 'CreditCard',
  color text not null default '#3B82F6',
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Create Paylater Payments Table (Settlements)
create table public.paylater_payments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  paylater_id uuid references public.paylater_platforms(id) on delete cascade not null,
  wallet_id uuid references public.wallets(id) on delete cascade not null,
  amount numeric(15, 2) not null check (amount > 0.00),
  payment_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Modify Transactions Table
alter table public.transactions add column paylater_id uuid references public.paylater_platforms(id) on delete set null;
alter table public.transactions alter column wallet_id drop not null;
alter table public.transactions add constraint check_wallet_or_paylater check (
  (wallet_id is not null and paylater_id is null) or 
  (wallet_id is null and paylater_id is not null)
);

-- 4. Enable Row Level Security (RLS)
alter table public.paylater_platforms enable row level security;
alter table public.paylater_payments enable row level security;

-- 5. Create RLS Policies for Paylater Platforms
create policy "Users can read own paylater platforms"
  on public.paylater_platforms for select to authenticated
  using (user_id = auth.uid());

create policy "Users can insert own paylater platforms"
  on public.paylater_platforms for insert to authenticated
  with check (user_id = auth.uid());

create policy "Users can update own paylater platforms"
  on public.paylater_platforms for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete own paylater platforms"
  on public.paylater_platforms for delete to authenticated
  using (user_id = auth.uid());

-- 6. Create RLS Policies for Paylater Payments
create policy "Users can read own paylater payments"
  on public.paylater_payments for select to authenticated
  using (user_id = auth.uid());

create policy "Users can insert own paylater payments"
  on public.paylater_payments for insert to authenticated
  with check (user_id = auth.uid());

create policy "Users can update own paylater payments"
  on public.paylater_payments for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete own paylater payments"
  on public.paylater_payments for delete to authenticated
  using (user_id = auth.uid());

-- 7. Redefine Transaction Balance Synchronization Trigger
create or replace function public.update_wallet_balance_from_transaction()
returns trigger as $$
begin
  -- Revert old values on update or delete
  if (TG_OP = 'DELETE' or TG_OP = 'UPDATE') then
    if (old.wallet_id is not null) then
      if (old.type = 'income') then
        update public.wallets set balance = balance - old.amount where id = old.wallet_id;
      else
        update public.wallets set balance = balance + old.amount where id = old.wallet_id;
      end if;
    elsif (old.paylater_id is not null) then
      if (old.type = 'income') then
        update public.paylater_platforms set balance = balance + old.amount where id = old.paylater_id;
      else
        update public.paylater_platforms set balance = balance - old.amount where id = old.paylater_id;
      end if;
    end if;
  end if;

  -- Apply new values on insert or update
  if (TG_OP = 'INSERT' or TG_OP = 'UPDATE') then
    if (new.wallet_id is not null) then
      if (new.type = 'income') then
        update public.wallets set balance = balance + new.amount where id = new.wallet_id;
      else
        update public.wallets set balance = balance - new.amount where id = new.wallet_id;
      end if;
    elsif (new.paylater_id is not null) then
      if (new.type = 'income') then
        update public.paylater_platforms set balance = balance - new.amount where id = new.paylater_id;
      else
        update public.paylater_platforms set balance = balance + new.amount where id = new.paylater_id;
      end if;
    end if;
  end if;

  return null;
end;
$$ language plpgsql security definer;

-- 8. Create Paylater Payment Trigger Function
create or replace function public.update_balance_from_paylater_payment()
returns trigger as $$
begin
  -- Revert old values
  if (TG_OP = 'DELETE' or TG_OP = 'UPDATE') then
    update public.wallets set balance = balance + old.amount where id = old.wallet_id;
    update public.paylater_platforms set balance = balance + old.amount where id = old.paylater_id;
  end if;

  -- Apply new values
  if (TG_OP = 'INSERT' or TG_OP = 'UPDATE') then
    update public.wallets set balance = balance - new.amount where id = new.wallet_id;
    update public.paylater_platforms set balance = balance - new.amount where id = new.paylater_id;
  end if;

  return null;
end;
$$ language plpgsql security definer;

-- 9. Create Trigger on Paylater Payments Table
create trigger on_paylater_payment_modified
  after insert or update or delete on public.paylater_payments
  for each row execute procedure public.update_balance_from_paylater_payment();

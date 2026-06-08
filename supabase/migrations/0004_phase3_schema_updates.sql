-- 1. Alter debts table
alter table public.debts add column type text not null check (type in ('owe', 'lend')) default 'owe';
alter table public.debts add column description text;

-- 2. Update update_wallet_balance_from_debt_payment trigger function
create or replace function public.update_wallet_balance_from_debt_payment()
returns trigger as $$
declare
  v_debt_type text;
  v_debt_id uuid;
begin
  v_debt_id := coalesce(new.debt_id, old.debt_id);
  
  -- Get the debt type
  select type into v_debt_type from public.debts where id = v_debt_id;
  
  if (TG_OP = 'INSERT') then
    if v_debt_type = 'lend' then
      update public.wallets set balance = balance + new.amount where id = new.wallet_id;
    else
      update public.wallets set balance = balance - new.amount where id = new.wallet_id;
    end if;
    update public.debts set paid_amount = paid_amount + new.amount where id = new.debt_id;
  elsif (TG_OP = 'DELETE') then
    if v_debt_type = 'lend' then
      update public.wallets set balance = balance - old.amount where id = old.wallet_id;
    else
      update public.wallets set balance = balance + old.amount where id = old.wallet_id;
    end if;
    update public.debts set paid_amount = paid_amount - old.amount where id = old.debt_id;
  elsif (TG_OP = 'UPDATE') then
    -- Revert old amount
    if v_debt_type = 'lend' then
      update public.wallets set balance = balance - old.amount where id = old.wallet_id;
    else
      update public.wallets set balance = balance + old.amount where id = old.wallet_id;
    end if;
    update public.debts set paid_amount = paid_amount - old.amount where id = old.debt_id;
    
    -- Apply new amount
    if v_debt_type = 'lend' then
      update public.wallets set balance = balance + new.amount where id = new.wallet_id;
    else
      update public.wallets set balance = balance - new.amount where id = new.wallet_id;
    end if;
    update public.debts set paid_amount = paid_amount + new.amount where id = new.debt_id;
  end if;

  update public.debts
  set status = case when paid_amount >= total_amount then 'paid'::text else 'unpaid'::text end
  where id = v_debt_id;

  return null;
end;
$$ language plpgsql security definer;

-- 3. Alter saving_goals table
alter table public.saving_goals add column icon text not null default 'Target';
-- Drop existing check constraint if it exists and create new one
alter table public.saving_goals drop constraint if exists saving_goals_status_check;
alter table public.saving_goals add constraint saving_goals_status_check check (status in ('ongoing', 'achieved', 'withdrawn'));

-- 4. Create goal_withdrawals table
create table public.goal_withdrawals (
  id uuid default gen_random_uuid() primary key,
  goal_id uuid references public.saving_goals(id) on delete cascade not null,
  wallet_id uuid references public.wallets(id) on delete cascade not null,
  amount numeric(15, 2) not null check (amount > 0),
  withdrawal_date date not null default current_date,
  created_at timestamptz not null default now()
);

-- 5. Enable RLS on goal_withdrawals
alter table public.goal_withdrawals enable row level security;

-- 6. Add policies for goal_withdrawals
create policy "Users can read own goal withdrawals"
  on public.goal_withdrawals for select to authenticated
  using (
    exists (
      select 1 from public.saving_goals
      where saving_goals.id = goal_withdrawals.goal_id
      and saving_goals.user_id = auth.uid()
    )
  );
  
create policy "Users can insert own goal withdrawals"
  on public.goal_withdrawals for insert to authenticated
  with check (
    exists (
      select 1 from public.saving_goals
      where saving_goals.id = goal_withdrawals.goal_id
      and saving_goals.user_id = auth.uid()
    )
  );

create policy "Users can update own goal withdrawals"
  on public.goal_withdrawals for update to authenticated
  using (
    exists (
      select 1 from public.saving_goals
      where saving_goals.id = goal_withdrawals.goal_id
      and saving_goals.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.saving_goals
      where saving_goals.id = goal_withdrawals.goal_id
      and saving_goals.user_id = auth.uid()
    )
  );

create policy "Users can delete own goal withdrawals"
  on public.goal_withdrawals for delete to authenticated
  using (
    exists (
      select 1 from public.saving_goals
      where saving_goals.id = goal_withdrawals.goal_id
      and saving_goals.user_id = auth.uid()
    )
  );

-- 7. Create trigger function for goal_withdrawals
create or replace function public.update_wallet_balance_from_goal_withdrawal()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    -- Withdrawing adds money to wallet, subtracts from goal
    update public.wallets set balance = balance + new.amount where id = new.wallet_id;
    update public.saving_goals set current_amount = current_amount - new.amount where id = new.goal_id;
  elsif (TG_OP = 'DELETE') then
    -- Reverting withdrawal subtracts money from wallet, adds back to goal
    update public.wallets set balance = balance - old.amount where id = old.wallet_id;
    update public.saving_goals set current_amount = current_amount + old.amount where id = old.goal_id;
  elsif (TG_OP = 'UPDATE') then
    -- Revert old amount
    update public.wallets set balance = balance - old.amount where id = old.wallet_id;
    update public.saving_goals set current_amount = current_amount + old.amount where id = old.goal_id;
    -- Apply new amount
    update public.wallets set balance = balance + new.amount where id = new.wallet_id;
    update public.saving_goals set current_amount = current_amount - new.amount where id = new.goal_id;
  end if;

  -- Update saving goal status
  update public.saving_goals
  set status = case 
    when current_amount <= 0 then 'withdrawn'::text
    when current_amount >= target_amount then 'achieved'::text 
    else 'ongoing'::text 
  end
  where id = coalesce(new.goal_id, old.goal_id);

  return null;
end;
$$ language plpgsql security definer;

create trigger on_goal_withdrawal_modified
  after insert or update or delete on public.goal_withdrawals
  for each row execute procedure public.update_wallet_balance_from_goal_withdrawal();

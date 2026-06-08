-- Migration to support Phase 2 columns and business rules

-- 1. Alter wallets table
alter table public.wallets
add column icon text not null default 'Wallet',
add column color text not null default '#0C5CAB',
add column is_default boolean not null default false,
add column is_archived boolean not null default false;

-- 2. Alter transactions table
alter table public.transactions
add column receipt_url text;

-- 3. Trigger to manage at-most-one default wallet per user
create or replace function public.handle_default_wallet()
returns trigger as $$
begin
  if new.is_default = true then
    update public.wallets
    set is_default = false
    where user_id = new.user_id and id <> new.id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_wallet_default_changed
  before insert or update of is_default on public.wallets
  for each row
  execute function public.handle_default_wallet();

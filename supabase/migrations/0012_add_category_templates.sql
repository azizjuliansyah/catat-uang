-- Migration: Add Category Templates Table and seed data

create table public.category_templates (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  type text not null check (type in ('income', 'expense')),
  icon text not null,
  color text not null,
  created_at timestamptz not null default now(),
  constraint category_templates_name_type_key unique (name, type)
);

-- Enable RLS
alter table public.category_templates enable row level security;

-- Policies
create policy "Anyone can read category templates"
  on public.category_templates for select to authenticated
  using (true);

create policy "Admins can manage category templates"
  on public.category_templates for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Seed data from user@catatuang.id categories
insert into public.category_templates (name, type, icon, color)
values
  ('Gaji', 'income', 'Briefcase', '#10B981'),
  ('Investasi', 'income', 'TrendingUp', '#3B82F6'),
  ('Makanan & Minuman', 'expense', 'Utensils', '#EF4444'),
  ('Transportasi', 'expense', 'Car', '#F59E0B'),
  ('Belanja', 'expense', 'ShoppingBag', '#EC4899'),
  ('Utilitas & Tagihan', 'expense', 'FileText', '#8B5CF6'),
  ('Hiburan', 'expense', 'Film', '#6366F1'),
  ('Lainnya', 'expense', 'HelpCircle', '#6B7280'),
  ('Hibah', 'income', 'Film', '#F59E0B')
on conflict (name, type) do nothing;

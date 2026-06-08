# CatatUang — Product Requirements Document
> **Agent Instructions:** This document is the single source of truth for building CatatUang. Read it fully before writing any code. Each section contains explicit implementation contracts. Follow the task breakdown in `## Implementation Tasks` per module. Do not deviate from the tech stack or schema defined here unless explicitly marked `[AGENT DECISION]`.

---

## Meta

```yaml
project: CatatUang
version: 2.0
status: ready-for-implementation
stack:
  frontend: Next.js 14 (App Router, TypeScript)
  backend: Supabase (PostgreSQL + RLS)
  styling: Tailwind CSS
  auth: Supabase Auth
  storage: Supabase Storage
  charts: Recharts
  export: jsPDF + SheetJS
  hosting: Vercel
currency: IDR only
locale: id-ID
```

---

## Project Overview

CatatUang is a personal finance management web app. Each user independently tracks their own income/expenses, manages debt, tracks saving goals, and views interactive financial reports.

**Core constraint:** All financial data is scoped to a `user_id`. Row Level Security (RLS) enforces this at the database level. No user can access data belonging to another user.

---

## User Roles

| Role | Scope | Key Permissions |
|------|-------|-----------------|
| `admin` | Platform-wide | Create/manage user accounts, suspend/delete accounts, audit logs. Cannot read financial data. |
| `user` | Own data only | Full CRUD on own financial data (wallets, transactions, debts, goals), export reports |

### Role Storage
- `users.role` stores `admin` or `user`
- Middleware at `/admin/*` routes must check `users.role = 'admin'`
- Regular app routes must check `users.role = 'user'` — admins are redirected to `/admin`

---

## Database Schema

> **Agent:** Run these as SQL migrations in Supabase. Enable RLS on every table. Apply policies listed per table.

### Tables

#### `users` (extends `auth.users`)
```sql
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  role text check (role in ('admin', 'user')) default 'user',
  status text check (status in ('active', 'suspended')) default 'active',
  created_at timestamptz default now()
);
```

#### `audit_logs`
```sql
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references users(id),
  action text not null, -- e.g. 'create_user', 'suspend_user', 'delete_user', 'reset_password'
  target_type text check (target_type in ('user')),
  target_id uuid,
  metadata jsonb,
  created_at timestamptz default now()
);
```

#### `wallets`
```sql
create table wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  icon text,
  color text,
  balance numeric(15,2) default 0,
  is_default boolean default false,
  is_archived boolean default false,
  created_at timestamptz default now()
);
```

#### `categories`
```sql
create table categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  icon text,
  color text,
  type text check (type in ('income', 'expense')) not null,
  is_default boolean default false,
  created_at timestamptz default now()
);
```

#### `transactions`
```sql
create table transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  wallet_id uuid references wallets(id),
  category_id uuid references categories(id),
  type text check (type in ('income', 'expense', 'transfer')) not null,
  amount numeric(15,2) not null,
  note text,
  receipt_url text,
  date date not null default current_date,
  created_at timestamptz default now()
);
```

#### `transfers`
```sql
create table transfers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  from_wallet_id uuid references wallets(id),
  to_wallet_id uuid references wallets(id),
  amount numeric(15,2) not null,
  note text,
  date date not null default current_date,
  created_at timestamptz default now()
);
```

#### `debts`
```sql
create table debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  contact_name text not null,
  type text check (type in ('owe', 'lend')) not null, -- owe = I owe them, lend = they owe me
  amount numeric(15,2) not null,
  paid_amount numeric(15,2) default 0,
  due_date date,
  status text check (status in ('active', 'settled')) default 'active',
  note text,
  created_at timestamptz default now()
);
```
> **Agent note:** `status` must be updated automatically to `settled` when `paid_amount >= amount`. Implement via Supabase trigger or enforce in application layer on every payment insert.

#### `debt_payments`
```sql
create table debt_payments (
  id uuid primary key default gen_random_uuid(),
  debt_id uuid references debts(id) on delete cascade,
  amount numeric(15,2) not null,
  proof_url text,
  note text,
  paid_at timestamptz default now()
);
```

#### `saving_goals`
```sql
create table saving_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  icon text,
  target_amount numeric(15,2) not null,
  current_amount numeric(15,2) default 0,
  target_date date,
  status text check (status in ('active', 'completed', 'withdrawn')) default 'active',
  created_at timestamptz default now()
);
```

#### `goal_topups`
```sql
create table goal_topups (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid references saving_goals(id) on delete cascade,
  wallet_id uuid references wallets(id),
  amount numeric(15,2) not null,
  note text,
  created_at timestamptz default now()
);
```

---

## RLS Policies

> **Agent:** Apply these policies after creating tables. Test with `set role authenticated; set request.jwt.claims...` pattern in Supabase SQL editor.

```sql
-- Pattern for user-scoped tables (apply to: wallets, categories, transactions, transfers, debts, saving_goals)
alter table wallets enable row level security;

create policy "users can read own wallets"
  on wallets for select
  using (user_id = auth.uid());

create policy "users can insert own wallets"
  on wallets for insert
  with check (user_id = auth.uid());

create policy "users can update own wallets"
  on wallets for update
  using (user_id = auth.uid());

create policy "users can delete own wallets"
  on wallets for delete
  using (user_id = auth.uid());

-- Repeat pattern for all user-scoped tables
-- For debt_payments: allow access if debt belongs to auth.uid()
-- For goal_topups: allow access if goal belongs to auth.uid()
-- For audit_logs: no RLS — access via service_role key only from admin API routes
```

---

## Application Routes

### User-facing (`/`)

| Route | Page | Auth Required |
|-------|------|---------------|
| `/` | Redirect → `/dashboard` if logged in, else `/auth/login` | - |
| `/auth/login` | Login (email/password) | No |
| `/dashboard` | Summary: total balance, income this month, expenses, active debts | Yes (role=user) |
| `/transactions` | Transaction list + filters + search | Yes (role=user) |
| `/transactions/new` | New transaction form | Yes (role=user) |
| `/transactions/[id]` | Transaction detail + edit | Yes (role=user) |
| `/wallets` | Wallet cards + transfer form | Yes (role=user) |
| `/debts` | Tabs: owe / lend + payment history | Yes (role=user) |
| `/goals` | Saving goals + top-up | Yes (role=user) |
| `/reports` | Charts + export | Yes (role=user) |
| `/settings` | Profile, categories | Yes (role=user) |

### Admin (`/admin`)

| Route | Page | Auth Required |
|-------|------|---------------|
| `/admin` | Platform dashboard: total users, new registrations, active users | role=admin |
| `/admin/users` | All users: search, filter, actions | role=admin |
| `/admin/users/new` | Create new user form | role=admin |
| `/admin/users/[id]` | User detail + admin action history | role=admin |
| `/admin/audit-log` | Full audit log with filters | role=admin |

> **Agent:** Protect all `/admin/*` routes in `middleware.ts`. Check `users.role = 'admin'` via service role client. Redirect non-admins to `/dashboard`. Redirect admins trying to access `/dashboard` to `/admin`.

---

## Feature Modules

### M1 — Auth

**Acceptance criteria:**
- [ ] Login page: email + password only. No register link visible.
- [ ] On successful login, check `users.role`:
  - `user` → redirect to `/dashboard`
  - `admin` → redirect to `/admin`
- [ ] Suspended users (`status = 'suspended'`) receive redirect to `/suspended` page on any authenticated request — enforce in middleware
- [ ] Logout clears session and redirects to `/auth/login`

---

### M2 — Wallets

**Acceptance criteria:**
- [ ] User can create wallet with name, icon, color, initial balance
- [ ] Dashboard shows all wallets as cards with current balance
- [ ] Balance updates automatically when transactions are added/edited/deleted (via DB trigger or recalculation)
- [ ] User can transfer between wallets — creates a `transfer` record and adjusts both wallet balances atomically
- [ ] User can archive a wallet (hides from active list, preserves transaction history)
- [ ] One wallet can be set as default — pre-selected in new transaction form

**Balance calculation:**
```
wallet.balance = initial_balance
  + SUM(transactions WHERE type='income' AND wallet_id=X)
  - SUM(transactions WHERE type='expense' AND wallet_id=X)
  - SUM(transfers WHERE from_wallet_id=X)
  + SUM(transfers WHERE to_wallet_id=X)
```
> **Agent:** Implement balance as a computed value or maintain via trigger. Do not rely on `wallets.balance` column alone without a consistency mechanism.

---

### M3 — Transactions

**Acceptance criteria:**
- [ ] Form fields: type (income/expense), amount, category, wallet, date, note, receipt photo
- [ ] Receipt photo uploads to Supabase Storage bucket `receipts`, stores URL in `receipt_url`
- [ ] Transaction list supports filter by: date range, category, wallet, type
- [ ] Transaction list supports keyword search on `note` field
- [ ] User can edit/delete their own transactions

---

### M4 — Debts & Receivables

**Acceptance criteria:**
- [ ] Two tabs: "Hutang Saya" (type=owe) and "Piutang Saya" (type=lend)
- [ ] Create debt: contact name, amount, due date, note
- [ ] Record payment: amount, proof photo → inserts into `debt_payments` → updates `debts.paid_amount`
- [ ] Auto-update `debts.status` to `settled` when `paid_amount >= amount`
- [ ] Remaining amount displayed: `amount - paid_amount`
- [ ] Settled debts visible in archive tab

---

### M5 — Reports

**Acceptance criteria:**
- [ ] Dashboard summary: total balance (all wallets), income this month, expenses this month, net cashflow
- [ ] Cashflow chart: bar/line chart, income vs expense per month, last 12 months (Recharts)
- [ ] Category breakdown: donut chart of expense by category for selected period
- [ ] Net worth chart: (total wallet balances) - (total active debt owed) plotted over time [AGENT DECISION: calculate monthly snapshots or real-time]
- [ ] All charts support period filter: this month / last 3 months / last 6 months / this year / custom range
- [ ] Export to PDF: uses jsPDF, captures chart as canvas image + transaction table
- [ ] Export to Excel: uses SheetJS, one sheet per: transactions, summary, debt list

---

### M6 — Saving Goals

**Acceptance criteria:**
- [ ] Create goal: name, icon, target amount, target date
- [ ] Top-up: select source wallet, enter amount → deducts from wallet, adds to `goal.current_amount`
- [ ] Progress bar: `current_amount / target_amount * 100`
- [ ] ETA calculation: `remaining / avg_monthly_topup` → display "estimated completion: [month year]"
- [ ] Withdraw: move funds back to selected wallet, set goal status to `withdrawn`

---

### M7 — Admin Panel

**Acceptance criteria:**
- [ ] `/admin` dashboard: total users, new registrations (last 7 days / 30 days), active users (logged in last 30 days)
- [ ] `/admin/users`: paginated table — name, email, status, role, created_at
- [ ] Search by email or name; filter by status (active / suspended)
- [ ] **Create user**: form with full name, email, password, role (admin/user) → creates account via Supabase Admin API (`service_role`) → inserts into `users` table → inserts into `audit_logs`
- [ ] Actions per user: suspend (sets `users.status = 'suspended'`), unsuspend, reset password, delete account (hard delete with confirmation modal)
- [ ] Every admin action inserts a record into `audit_logs`
- [ ] `/admin/audit-log`: display as paginated table with filter by admin, action type, date range
- [ ] Admin cannot view `transactions`, `wallets`, `debts`, or any financial table — no UI, no API route

---

## Project Structure

```
catatuang/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── callback/route.ts
│   ├── (app)/
│   │   ├── layout.tsx              # sidebar + navbar, auth guard (role=user only)
│   │   ├── dashboard/page.tsx
│   │   ├── transactions/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── wallets/page.tsx
│   │   ├── debts/page.tsx
│   │   ├── goals/page.tsx
│   │   ├── reports/page.tsx
│   │   └── settings/page.tsx
│   ├── (admin)/
│   │   ├── layout.tsx              # admin auth guard (role=admin only)
│   │   ├── admin/page.tsx
│   │   ├── admin/users/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx
│   │   └── admin/audit-log/page.tsx
│   └── api/
│       └── export/                 # PDF/Excel generation endpoints
├── components/
│   ├── ui/                         # shadcn/ui base components
│   ├── transactions/
│   ├── wallets/
│   ├── debts/
│   ├── charts/
│   └── admin/
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # browser client
│   │   ├── server.ts               # server component client
│   │   └── admin.ts                # service_role client (admin only)
│   ├── hooks/                      # useTransactions, useWallets, etc.
│   ├── utils/
│   │   ├── currency.ts             # formatRupiah(amount: number)
│   │   └── date.ts                 # indonesian date helpers
│   └── types/
│       └── database.types.ts       # generated from supabase CLI
├── supabase/
│   ├── migrations/                 # all SQL migration files
│   └── seed.sql                    # default categories seed
└── middleware.ts                   # auth guard + admin guard + suspended check
```

---

## Middleware Logic

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const session = await getSession(request)

  // Unauthenticated: redirect to login
  if (!session) {
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin') || /* other protected routes */) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
    return NextResponse.next()
  }

  const user = await getUserFromDB(session.user.id) // query users table via service_role

  // Suspended users: block all access
  if (user.status === 'suspended') {
    return NextResponse.redirect(new URL('/suspended', request.url))
  }

  // Admin routes: only role=admin allowed
  if (pathname.startsWith('/admin')) {
    if (user.role !== 'admin') return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // App routes: only role=user allowed (admins go to /admin)
  if (pathname.startsWith('/dashboard') || /* other app routes */) {
    if (user.role !== 'user') return NextResponse.redirect(new URL('/admin', request.url))
  }

  return NextResponse.next()
}
```

---

## Default Seed Data

> **Agent:** Insert these default categories when a new user account is created by admin.

```sql
-- Default expense categories
insert into categories (user_id, name, icon, color, type, is_default) values
  ($user_id, 'Makan & Minum', '🍜', '#F59E0B', 'expense', true),
  ($user_id, 'Transportasi', '🚗', '#3B82F6', 'expense', true),
  ($user_id, 'Belanja', '🛒', '#8B5CF6', 'expense', true),
  ($user_id, 'Tagihan', '⚡', '#EF4444', 'expense', true),
  ($user_id, 'Kesehatan', '💊', '#10B981', 'expense', true),
  ($user_id, 'Hiburan', '🎬', '#F97316', 'expense', true),
  ($user_id, 'Pendidikan', '📚', '#06B6D4', 'expense', true),
  ($user_id, 'Lainnya', '📦', '#6B7280', 'expense', true);

-- Default income categories
insert into categories (user_id, name, icon, color, type, is_default) values
  ($user_id, 'Gaji', '💰', '#10B981', 'income', true),
  ($user_id, 'Freelance', '💻', '#3B82F6', 'income', true),
  ($user_id, 'Investasi', '📈', '#8B5CF6', 'income', true),
  ($user_id, 'Lainnya', '📥', '#6B7280', 'income', true);
```

---

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # server-only, never expose to client
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Implementation Order

> **Agent:** Follow this sequence. Each phase must be fully working before proceeding.

```
Phase 1 — Foundation
  1. Supabase project setup + all migrations + RLS policies
  2. Auth flow (login → role-based redirect → session)
  3. Middleware (auth guard + role guard + suspended check)
  4. App shell layout (sidebar, navbar, responsive)

Phase 2 — Core Features
  5. Wallets (CRUD + transfer + balance calculation)
  6. Categories (CRUD + seed defaults on user creation)
  7. Transactions (CRUD + receipt upload + filter/search)
  8. Dashboard summary cards

Phase 3 — Financial Management
  9. Debts & receivables (CRUD + payment history + auto-settle)
  10. Saving goals (CRUD + top-up + ETA)

Phase 4 — Reports & Export
  11. Cashflow chart (Recharts)
  12. Category breakdown chart
  13. Net worth tracker
  14. Export PDF + Excel

Phase 5 — Admin Panel
  15. Admin layout + route protection
  16. Create user (Admin API + seed categories)
  17. User management (list, search, suspend, delete, reset password)
  18. Audit log
```

---

## Constraints & Non-Negotiables

- All monetary values stored as `numeric(15,2)` — never `float`
- All dates stored as `date` (not `timestamptz`) unless it's an event timestamp
- Currency display: always format as `Rp 1.500.000` using `id-ID` locale
- File uploads: max 5MB per file, accept `image/jpeg, image/png, image/webp`
- Mobile-first responsive design — test at pro375px, 768px, 1280px breakpoints
- No financial data accessible from admin routes — enforce at API level, not just UI
- RLS must be the last line of defense — never rely solely on application-layer checks
- User creation must use Supabase Admin API (`service_role`) — never expose user creation to client-side
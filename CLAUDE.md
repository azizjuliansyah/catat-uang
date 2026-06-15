# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

CatatUang is a personal finance management web app built with Next.js 16 (App Router) and Supabase. Each user independently tracks their income/expenses, manages debt, tracks saving goals, and views financial reports.

**Core constraint:** All financial data is scoped to `user_id`. Row Level Security (RLS) enforces this at the database level.

**Stack:** Next.js 16, Supabase (PostgreSQL + Auth + RLS), TypeScript, Tailwind CSS v4, lucide-react icons

---

## Development Commands

```bash
npm run dev          # Start dev server on http://localhost:3000
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
```

---

## Environment Variables

Required in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=           # Server-only, never expose to client
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Architecture

### Supabase Client Pattern

Three distinct clients — always pick the right one:

- **`lib/supabase/client.ts`** — Browser client for `"use client"` components
- **`lib/supabase/server.ts`** — Server component client (uses `anon` key)
- **`lib/supabase/admin.ts`** — `service_role` key for privileged ops (user mgmt, audit logs)

### AppProvider (Global Shared State)

`app/providers/AppProvider.tsx` wraps the entire `(app)` layout and provides shared data via `useApp()`:

- `user` / `loadingUser` — authenticated Supabase user
- `wallets` / `loadingWallets` — all user wallets
- `categories` / `loadingCategories` — all user categories
- `paylaterPlatforms` / `loadingPaylaterPlatforms` — all paylater platforms
- `refreshWallets()`, `refreshCategories()`, `refreshPaylaterPlatforms()` — manual refetch triggers

Pages that need wallets or categories pull them from `useApp()` instead of fetching independently. After a mutation, call the relevant `refresh*()` function to sync the shared state.

```tsx
const { wallets, categories, refreshWallets } = useApp();
```

### Route Groups & Layouts

- **`app/(app)/`** — User-facing routes; `app/(app)/layout.tsx` renders the sidebar + auth guard
- **`app/auth/`** — Login page
- **`app/admin/`** — Admin panel (`role=admin` only)
- **`app/suspended/`** — Suspended user landing

Auth is enforced in `app/(app)/layout.tsx` via `useApp()` — it redirects to `/auth/login` if no user, or `/admin` if `app_metadata.role === "admin"`.

### Complex Page Hook Pattern

Feature-heavy pages split logic into two hooks:

- **`use[Feature]State`** — all `useState` declarations, derived/filtered data, modal open/close helpers
- **`use[Feature]Handlers`** — async operations (Supabase reads/writes, file uploads, form submits)

Example: `app/(app)/debts/hooks/useDebtsState.ts` + `useDebtsHandlers.ts`

### Database Schema Key Points

All financial tables use `user_id uuid references auth.users(id) on delete cascade`:

- **`wallets`** — balance tracking
- **`categories`** — income/expense categories with icon/color
- **`transactions`** — linked to wallet and category
- **`transfers`** — wallet-to-wallet transfers
- **`debts`** / **`debt_payments`** / **`debt_transactions`** / **`debt_transaction_proofs`** — debt tracking with multi-package support and proof uploads
- **`saving_goals`** — savings goals with progress
- **`paylater_platforms`** — BNPL platform credit limits and billing cycles
- **`paylater_transactions`** — usage/payment records per platform

Monetary values use `numeric(15,2)` — never float.

---

## Design System

### CSS Variables (Tailwind v4)

All colors defined in `app/globals.css` using `@theme`. Never use raw hex values — always use these tokens:

- **Surfaces:** `bg-surface`, `bg-surface-card`, `bg-surface-input`, `bg-surface-hover`
- **Brand:** `bg-primary`, `hover:bg-primary-hover`, `text-primary`
- **Text:** `text-text-primary`, `text-text-secondary`, `text-text-muted`
- **Finance semantic:** `text-income` (green), `text-expense` (red), `text-transfer` (indigo)
- **Debt semantic:** `text-debt-owe` (amber), `text-debt-lend` (cyan)
- **Status:** `text-text-success`, `text-feedback-error`, `bg-feedback-error`
- **Borders:** `border-border`, `border-border-strong`

### Typography

- **Primary font:** IBM Plex Sans — `font-sans` or `font-display`
- **Mono font:** IBM Plex Sans Mono — `font-mono`
- All currency amounts **must** use `font-mono`

### Icon System

```tsx
import { getIconComponent } from "@/lib/utils/icons";

const IconComponent = getIconComponent(wallet.icon);
<IconComponent className="w-5 h-5" />
```

### Currency Formatting

Use `formatIDR` from `lib/utils/format.ts` — do not redefine inline:

```tsx
import { formatIDR } from "@/lib/utils/format";
// Output: "Rp 1.500.000"
```

### Component Atomic Structure

`components/ui/` follows atoms → molecules → organisms:

- **atoms:** `Button`, `Input`, `Select`, `CustomSelect`, `Badge`, `Spinner`, `ActionButton`, `StatusBadge`, `DynamicColorIcon`, `DatePeriodFilter`
- **molecules:** `FormField`, `Toast`, `Breadcrumbs`, `TabButton`, `Tooltip`, `InfoCard`, `UploadZone`, `FilePreviewCard`
- **organisms:** `Modal`, `DeleteConfirmationModal`, `EmptyState`, `SkeletonLoading`, `FinancialCard`, `TransactionDetailModal`

---

## Important Conventions

### Role-Based Access

- **`user`** role: `/dashboard`, `/transactions`, `/wallets`, `/paylater`, `/debts`, `/goals`, `/reports`, `/settings`
- **`admin`** role: `/admin/*` only — never accesses financial tables
- **`suspended`** status: redirected to `/suspended`

Role is stored in `user.app_metadata.role` (set via Supabase Auth admin API, not `public.users`).

### Loading & Empty States

- Skeletons: `animate-pulse bg-surface-hover` placeholders
- Empty states: centered card with `border-dashed`, an icon, description text, and a CTA button

### Database Queries

Always include `user_id` filter; RLS is a safety net, not a substitute:

```tsx
const { data } = await supabase
  .from("transactions")
  .select("*, wallets(name), categories(name, icon, color)")
  .eq("user_id", user.id);
```

---

## Key Constraints

1. **Monetary values:** `numeric(15,2)` in PostgreSQL — never float
2. **Dates:** Store as `timestamptz`; use `lib/utils/date.ts` helpers for formatting/parsing
3. **Currency display:** Always `formatIDR()` from `lib/utils/format.ts`
4. **RLS:** All user-scoped tables require RLS policies
5. **Admin isolation:** Admin routes cannot read financial tables
6. **Shared state:** Wallets, categories, and paylater platforms come from `AppProvider` — don't re-fetch them inside individual pages

---

## Supabase Migrations

Apply in order via Supabase SQL editor or CLI:

- `0001` — Core tables (wallets, categories, transactions, transfers, debts, saving_goals)
- `0002` — Phase 2 schema updates
- `0003` — Storage buckets (receipts)
- `0004` — Phase 3 schema updates
- `0005` — Date columns to timestamp
- `0006` — Make due_date nullable
- `0007` — Add proof_url to debts
- `0008` — Phase 4 debt relations (debt_transactions, debt_transaction_proofs)
- `0009` — Add target fields to audit_logs
- `0010` — Paylater tables (paylater_platforms, paylater_transactions)

---

## Page Routes Reference

### User Routes (`role=user`)
- `/dashboard` — Financial summary, wallets, recent transactions
- `/transactions` — Transaction list with filters
- `/transactions/new` — New transaction form
- `/transactions/[id]` — Transaction detail/edit
- `/wallets` — Wallet management
- `/paylater` — BNPL platform credit tracking
- `/paylater/[id]` — Paylater platform detail & transaction history
- `/debts` — Debt tracking (owe/lend)
- `/debts/[id]` — Debt detail
- `/goals` — Saving goals
- `/goals/[id]` — Goal detail
- `/reports` — Financial reports/charts
- `/settings` — Profile, security, categories

### Admin Routes (`role=admin`)
- `/admin` — Admin dashboard
- `/admin/users` — User management
- `/admin/users/new` — Create user
- `/admin/users/[id]` — User detail & audit logs
- `/admin/audit-log` — System audit logs
- `/admin/settings` — Admin settings

### Special Routes
- `/auth/login` — Login page
- `/suspended` — Suspended account page

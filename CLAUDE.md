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
# Development
npm run dev          # Start dev server on http://localhost:3000

# Build & Production
npm run build        # Production build
npm run start        # Start production server

# Linting
npm run lint         # Run ESLint
```

---

## Environment Variables

Required in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=           # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=      # Supabase anon key (client-safe)
SUPABASE_SERVICE_ROLE_KEY=           # Service role key (server-only, never expose)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Architecture

### Supabase Client Pattern

Three distinct Supabase clients for different contexts:

- **`lib/supabase/client.ts`** - Browser client for client components
- **`lib/supabase/server.ts`** - Server component client (uses `anon` key)
- **`lib/supabase/admin.ts`** - Admin client using `service_role` key for privileged operations

Use the appropriate client based on context:
- Client components → `createClient()` from `client.ts`
- Server components → `await createClient()` from `server.ts`
- Admin operations (user management, audit logs) → `await createAdminClient()` from `admin.ts`

### Route Groups & Layouts

- **`app/(app)/`** - User-facing routes with shared sidebar layout (`app/(app)/layout.tsx`)
- **`app/auth/`** - Authentication routes (login)
- **`app/admin/`** - Admin panel routes (role: `admin`)
- **`app/suspended/`** - Suspended user page

Route groups use parentheses for file organization without affecting URL structure.

### Middleware (`middleware.ts`)

Critical authentication and authorization logic:

1. **Suspension guard:** Redirects suspended users to `/suspended`
2. **Unauthenticated:** Redirects to `/auth/login`
3. **Role-based redirects:**
   - `role=user` trying to access `/admin/*` → `/dashboard`
   - `role=admin` trying to access `/dashboard` → `/admin`
   - Authenticated users on `/auth/login` → role-appropriate dashboard

Role is stored in `user.app_metadata.role` (set via Supabase Auth admin API).

### Database Schema Key Points

All financial tables use `user_id uuid references auth.users(id) on delete cascade`:

- **`wallets`** - User wallets with balance tracking
- **`categories`** - User-defined income/expense categories with icons
- **`transactions`** - Financial transactions linked to wallet and category
- **`transfers`** - Wallet-to-wallet transfers
- **`debts`** - Debt tracking (owe/lend) with status auto-updates
- **`debt_payments`** - Payment records for debts
- **`saving_goals`** - Savings goals with progress tracking

Monetary values use `numeric(15,2)` — never float.

---

## Design System

### CSS Variables (Tailwind v4)

All colors defined in `app/globals.css` using `@theme`:

- **Surfaces:** `surface`, `surface-card`, `surface-input`, `surface-hover`
- **Brand:** `primary`, `primary-hover`
- **Text:** `text-primary`, `text-secondary`, `text-muted`
- **Finance semantic:** `income` (green), `expense` (red), `transfer` (indigo)
- **Debt semantic:** `debt-owe` (amber), `debt-lend` (cyan)
- **Goal semantic:** `goal-active` (purple), `goal-complete` (green)
- **Status:** `success`, `warning`, `danger`, `info`
- **Borders:** `border`, `border-strong`

Use tokens like `bg-surface-card`, `text-income`, `border-border-strong` — never raw hex values.

### Typography

- **Primary:** IBM Plex Sans (variable: `--font-ibm-plex-sans`)
- **Mono:** IBM Plex Sans Mono (variable: `--font-ibm-plex-sans-mono`)
- All currency amounts MUST use `font-mono` class

### Icon System

Icons from `lucide-react`, mapped via `lib/utils/icons.ts`:

```tsx
import { getIconComponent } from "@/lib/utils/icons";

const IconComponent = getIconComponent(wallet.icon);
<IconComponent className="w-5 h-5" />
```

### Currency Formatting

Use `id-ID` locale for all currency displays:

```tsx
const formatIDR = (val: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(val);
};
```

Output: `"Rp 1.500.000"`

---

## Important Conventions

### Role-Based Access

- **`user`** role: Can access `/dashboard`, `/transactions`, `/wallets`, `/debts`, `/goals`, `/reports`, `/settings`
- **`admin`** role: Can access `/admin` routes only
- **`suspended`** status: Redirected to `/suspended` page

Admin panel NEVER displays financial data — enforced at both middleware and UI level.

### Page Structure Patterns

**Client Components with Data Fetching:**

```tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Page() {
  const supabase = createClient();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data, error } = await supabase.from("table").select("*");
      setData(data);
      setLoading(false);
    }
    loadData();
  }, [supabase]);

  if (loading) return <Skeleton />;
  return <PageContent data={data} />;
}
```

**Loading States:** Use skeleton placeholders with `animate-pulse bg-surface-hover`

**Empty States:** Centered content with illustration, descriptive text, and CTA

### Database Queries

Always include `user_id` filter for financial data:

```tsx
const { data } = await supabase
  .from("transactions")
  .select("*, wallets(name), categories(name, icon, color)")
  .eq("user_id", user.id);
```

### File Organization

- **`lib/supabase/`** - Supabase client factories
- **`lib/utils/`** - Utility functions (icons, formatters)
- **`supabase/migrations/`** - SQL migration files
- **`app/(app)/`** - User app pages
- **`app/admin/`** - Admin panel pages

---

## Key Constraints

1. **Monetary values:** Always `numeric(15,2)` in PostgreSQL, never float
2. **Dates:** Store as `date`, display using `id-ID` locale
3. **Currency:** Always format as `"Rp 1.500.000"` with thousand separators
4. **RLS:** All user-scoped tables require RLS policies
5. **Admin isolation:** Admin routes cannot access financial tables (enforced in middleware)
6. **Role storage:** Role stored in `user.app_metadata.role`, not `public.users` table

---

## Supabase Migrations

Run migrations in Supabase SQL editor or via CLI:

- `0001_initial_schema.sql` - Core tables (users, wallets, categories, transactions, etc.)
- `0002_phase2_schema_updates.sql` - Schema updates
- `0003_storage_setup.sql` - Storage buckets (receipts)
- `0004_phase3_schema_updates.sql` - Additional schema changes

---

## Page Routes Reference

### User Routes (`role=user`)
- `/` → Redirects to `/dashboard` or `/auth/login`
- `/auth/login` → Login page
- `/dashboard` → Financial summary cards, wallets, recent transactions
- `/transactions` → Transaction list with filters
- `/transactions/new` → New transaction form
- `/transactions/[id]` → Transaction detail/edit
- `/wallets` → Wallet management
- `/debts` → Debt tracking
- `/goals` → Saving goals
- `/reports` → Financial reports/charts
- `/settings` → User settings

### Admin Routes (`role=admin`)
- `/admin` → Admin dashboard
- `/admin/users` → User management
- `/admin/audit-log` → System audit logs

### Special Routes
- `/suspended` → Suspended account page

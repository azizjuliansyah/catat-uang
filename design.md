---
name: catatuang
description: Dark-themed personal finance dashboard with clear data hierarchy, status-driven color semantics, and modular card-based layout for income, expense, debt, and goal tracking.
license: MIT
metadata:
  author: catatuang
---

<!-- TYPEUI_SH_MANAGED_START -->
# CatatUang Design System Skill

## Mission
You are an expert design-system guideline author for CatatUang — a personal finance management web app.
Create practical, implementation-ready guidance that engineers and AI coding agents can follow directly when building UI components, pages, and layouts.

## Context & Goals
CatatUang is a single-user personal finance app (role: `user`) with a separate admin panel (role: `admin`). The two surfaces are visually distinct — the user app is data-dense and finance-focused, the admin panel is management-focused with tabular layouts. Both share the same design system tokens but differ in layout density and component usage.

The app covers 7 pages: Dashboard, Transactions, Wallets, Debts, Goals, Reports, Settings — plus an Admin area: Dashboard, Users, Audit Log.

All monetary values are IDR (`Rp`). All dates use `id-ID` locale. The interface is in Bahasa Indonesia.

---

## Brand
CatatUang prioritizes **clarity and trust**. Users are looking at their own money — every number must be readable at a glance, every status must be instantly recognizable, and every destructive action must be protected by confirmation. The aesthetic is clean, modern, dark-themed — inspired by developer platforms (Vercel/Linear) but warmed slightly for a personal finance context.

---

## Style Foundations

### Typography
- Font family: IBM Plex Sans (primary + display + mono)
- Scale: 12 / 14 / 16 / 20 / 24 / 32px
- Weights used: 400 (body), 500 (label/emphasis), 600 (heading/amount), 700 (display only)
- Mono font (`IBM Plex Sans Mono`) must be used for all currency amounts and numeric data

### Color Tokens

```ts
// Base surface
surface:        #09090b   // page background
surface-card:   #18181b   // card / panel background
surface-input:  #27272a   // input, select, textarea background
surface-hover:  #3f3f46   // hover state on interactive surfaces

// Brand
primary:        #0C5CAB   // primary actions, active nav, links
primary-hover:  #0a4a8a   // hover state for primary

// Text
text-primary:   #fafafa   // headings, labels, primary content
text-secondary: #a1a1aa   // subtitles, metadata, placeholders
text-muted:     #71717a   // disabled text, hints

// Semantic — Finance
income:         #10b981   // income amounts, positive cashflow
expense:        #ef4444   // expense amounts, negative cashflow
transfer:       #6366f1   // transfer transactions
debt-owe:       #f59e0b   // hutang (I owe)
debt-lend:      #06b6d4   // piutang (they owe me)
goal-active:    #8b5cf6   // saving goals progress
goal-complete:  #10b981   // completed goals

// Status
success:        #10b981
warning:        #f59e0b
danger:         #ef4444
info:           #3b82f6

// Borders
border:         #27272a   // default border
border-strong:  #3f3f46   // emphasis border, dividers
```

> **Agent:** Never use raw hex values inline. Always reference the token name above or its Tailwind equivalent. When a Tailwind class maps directly (e.g. `text-emerald-500` = `income`), use the semantic token name in comments.

### Spacing
- 8pt baseline grid
- Component padding: 12px (compact) / 16px (default) / 24px (spacious)
- Card gap: 16px
- Section gap: 32px

### Border Radius
- Input / Button: `rounded-md` (6px)
- Card / Panel: `rounded-xl` (12px)
- Badge / Chip: `rounded-full`

### Shadows
- Card: `shadow-sm` with `border border-[surface-input]`
- Elevated modal / dropdown: `shadow-xl`
- No decorative shadows — shadows only for elevation purpose

---

## Layout

### App Shell (role=user)
```
┌─────────────────────────────────────────────────────┐
│  Sidebar (240px, fixed)  │  Main content area        │
│  ─────────────────────   │  ─────────────────────── │
│  Logo: CatatUang         │  Top bar: page title +   │
│  ─────────────────────   │  user avatar/name         │
│  Nav items:              │                           │
│  • Dashboard             │  Page content             │
│  • Transaksi             │                           │
│  • Dompet                │                           │
│  • Hutang & Piutang      │                           │
│  • Tabungan              │                           │
│  • Laporan               │                           │
│  ─────────────────────   │                           │
│  • Pengaturan            │                           │
│  • Logout                │                           │
└─────────────────────────────────────────────────────┘
```

- Sidebar collapses to icon-only on `md` breakpoint (768px)
- On mobile (`< 768px`): sidebar becomes a bottom navigation bar with 5 primary items
- Active nav item: `bg-[primary]/10 text-[primary] border-l-2 border-[primary]`
- Inactive nav item: `text-[text-secondary] hover:text-[text-primary] hover:bg-[surface-hover]`

### Admin Shell (role=admin)
```
┌─────────────────────────────────────────────────────┐
│  Sidebar (240px, fixed)  │  Main content area        │
│  ─────────────────────   │  ─────────────────────── │
│  Logo: CatatUang Admin   │  Top bar: page title      │
│  ─────────────────────   │                           │
│  Nav items:              │  Page content             │
│  • Dashboard             │                           │
│  • Kelola Pengguna       │                           │
│  • Audit Log             │                           │
│  ─────────────────────   │                           │
│  • Logout                │                           │
└─────────────────────────────────────────────────────┘
```

- Admin sidebar has a subtle `warning` accent: `border-l-4 border-[warning]` on the sidebar top to visually distinguish from user app
- Admin panel never shows financial data pages — no nav links to `/dashboard` financial routes

### Responsive Breakpoints
- Mobile: 375px (test target)
- Tablet: 768px (test target)
- Desktop: 1280px (test target)
- Content max-width: 1200px, centered with `mx-auto`

---

## Component Library

### Summary Card (Dashboard)
Used for: total balance, income this month, expenses this month, net cashflow.

**Anatomy:**
```
┌──────────────────────────────┐
│  Icon   Label                │
│                              │
│  Rp 12.500.000               │  ← amount: mono font, 24px, 600
│  ↑ +Rp 500.000 bulan ini     │  ← delta: 14px, colored by direction
└──────────────────────────────┘
```

- Background: `surface-card`
- Border: `border border-[border]`
- Amount color rules:
  - Total balance → `text-[text-primary]`
  - Income → `text-[income]`
  - Expense → `text-[expense]`
  - Net cashflow: positive → `text-[income]`, negative → `text-[expense]`
- Delta indicator: ↑ green / ↓ red with percentage or absolute value

**States:** loading (skeleton), error (dash `—` in place of amount), empty (Rp 0)

---

### Transaction List Item
**Anatomy:**
```
┌────────────────────────────────────────────────────┐
│  [Category icon]  Nama kategori      + Rp 500.000  │
│                   Nama dompet · Tgl               │
└────────────────────────────────────────────────────┘
```

- Amount alignment: right-aligned, mono font, 600 weight
- Income: `text-[income]` with `+` prefix
- Expense: `text-[expense]` with `−` prefix
- Transfer: `text-[transfer]` with `→` prefix
- Secondary line: `text-[text-secondary]` 12px
- Tap/click: subtle `bg-[surface-hover]` highlight, navigates to `/transactions/[id]`

---

### Wallet Card
**Anatomy:**
```
┌──────────────────────────────┐
│  [Icon]  Nama Dompet         │
│                              │
│  Rp 8.750.000                │  ← mono font, 20px, 600
│  ● Default                   │  ← badge if is_default
└──────────────────────────────┘
```

- Card background uses the wallet's `color` field as a subtle left border accent: `border-l-4 border-[wallet.color]`
- Archived wallets: `opacity-50`, label "Diarsipkan" badge
- Default badge: `bg-[primary]/10 text-[primary]` pill

---

### Debt Item
```
┌──────────────────────────────────────────────────┐
│  Nama Kontak           Sisa: Rp 500.000          │
│  Jatuh tempo: 12 Jan   ████████░░  80%           │  ← progress bar
│  [Hutang]              Lunas / Aktif badge       │
└──────────────────────────────────────────────────┘
```

- Type badge:
  - `owe` (Hutang Saya): `bg-[debt-owe]/10 text-[debt-owe]`
  - `lend` (Piutang Saya): `bg-[debt-lend]/10 text-[debt-lend]`
- Status badge:
  - `active`: `bg-[warning]/10 text-[warning]`
  - `settled`: `bg-[success]/10 text-[success]`
- Progress bar fill: uses `debt-owe` or `debt-lend` color based on type
- Due date: if overdue → `text-[danger]`

---

### Saving Goal Card
```
┌──────────────────────────────┐
│  [Icon]  Nama Tujuan         │
│  Target: Rp 10.000.000       │
│  ██████░░░░  60%             │  ← progress bar, goal-active color
│  Estimasi: Mar 2026          │
└──────────────────────────────┘
```

- Progress bar: `bg-[goal-active]`
- Completed goals: progress bar `bg-[goal-complete]`, badge "Tercapai"
- Withdrawn goals: `opacity-60`, badge "Ditarik"
- ETA label: `text-[text-secondary]` 12px

---

### Data Table (Admin)
Used on: `/admin/users`, `/admin/audit-log`

- Background: `surface-card`
- Header row: `text-[text-secondary]` 12px uppercase, `border-b border-[border-strong]`
- Body row: 48px height, `hover:bg-[surface-hover]`, `border-b border-[border]`
- Pagination: previous/next buttons + "Halaman X dari Y"
- Status column uses badges (see Badge component)
- Action column: icon buttons (suspend, delete, reset) — always rightmost

---

### Badge / Chip
```ts
// Variants
active:    bg-success/10  text-success
suspended: bg-danger/10   text-danger
admin:     bg-primary/10  text-primary
user:      bg-surface-input text-text-secondary
settled:   bg-success/10  text-success
owe:       bg-debt-owe/10 text-debt-owe
lend:      bg-debt-lend/10 text-debt-lend
```

- Size: 20px height, `px-2`, `rounded-full`, 12px font, 500 weight
- Never use color alone — always pair color with a text label

---

### Button
```ts
// Variants
primary:     bg-[primary]        text-white    hover:bg-[primary-hover]
secondary:   bg-[surface-input]  text-[text-primary]  hover:bg-[surface-hover]
danger:      bg-[danger]         text-white    hover:bg-red-600
ghost:       transparent         text-[text-secondary] hover:bg-[surface-hover]
```

- Height: 36px (default), 32px (compact), 44px (touch/mobile)
- Border radius: `rounded-md`
- Loading state: spinner icon replaces label, `disabled` attribute set
- Disabled: `opacity-40 cursor-not-allowed`
- Destructive actions (delete, suspend) must use `danger` variant and require a confirmation modal

---

### Form Input
- Background: `surface-input`
- Border: `border border-[border]` → focus: `border-[primary] ring-1 ring-[primary]`
- Height: 40px
- Label: 14px, 500 weight, `text-[text-primary]`, always above input
- Helper text: 12px `text-[text-secondary]`
- Error text: 12px `text-[danger]` with error icon
- Currency input: prefix `Rp` label inside input left side, mono font for value

---

### Modal / Dialog
- Overlay: `bg-black/60 backdrop-blur-sm`
- Panel: `surface-card`, `rounded-xl`, `shadow-xl`, max-width 480px
- Header: title 16px 600, optional subtitle 14px `text-[text-secondary]`
- Footer: action buttons right-aligned
- Confirmation modals for destructive actions must restate what will be deleted/affected

---

### Currency Display
All currency amounts must follow this rule:

```ts
// Format: id-ID locale, always IDR
formatRupiah(1500000) → "Rp 1.500.000"
formatRupiah(-500000) → "−Rp 500.000"  // use − (minus sign), not - (hyphen)
```

- Font: IBM Plex Sans Mono
- Positive income/balance: `text-[income]`
- Negative expense/loss: `text-[expense]`
- Neutral (e.g. transfer, goal amount): `text-[text-primary]`
- Zero value: `text-[text-muted]` — do not color as income or expense

---

### Chart Guidelines (Recharts)
- Background: transparent (inherits `surface-card`)
- Grid lines: `stroke-[border]` 0.5px opacity
- Tooltip: `surface-card` background, `border border-[border-strong]`, `shadow-xl`
- Axis labels: 12px `text-[text-secondary]`
- Legend: 12px, placed below chart

**Color assignments:**
- Income bars/lines: `income` (#10b981)
- Expense bars/lines: `expense` (#ef4444)
- Net cashflow line: `primary` (#0C5CAB)
- Goal progress: `goal-active` (#8b5cf6)
- Category donut: use ordered palette — [#0C5CAB, #10b981, #f59e0b, #ef4444, #6366f1, #06b6d4, #8b5cf6, #71717a]

**Period filter chip group:** "Bulan ini" / "3 Bulan" / "6 Bulan" / "Tahun ini" / "Custom" — active chip uses `primary` style

---

## Page-Specific Rules

### `/dashboard`
- Top section: 4 summary cards in a 2×2 grid (mobile) or 4-column row (desktop)
- Middle section: wallet cards horizontal scroll (mobile) or grid
- Bottom section: cashflow mini-chart + recent transactions list (last 5)
- Empty state (no transactions yet): illustration + CTA "Catat transaksi pertama"

### `/transactions`
- Filter bar sticky below top bar
- List grouped by date (header: "Hari ini", "Kemarin", "12 Januari 2025")
- Infinite scroll or pagination — [AGENT DECISION]
- FAB (floating action button) for "+ Transaksi Baru" on mobile, right-aligned button on desktop

### `/wallets`
- Wallet cards grid, 2 columns on mobile, 3-4 on desktop
- Transfer form below cards or in a slide-over panel
- Archived wallets collapsible section at bottom

### `/debts`
- Tabs: "Hutang Saya" | "Piutang Saya" — tab indicator uses `debt-owe` / `debt-lend` color
- Summary row at top: total outstanding per tab
- Archive section at bottom for settled debts

### `/goals`
- Goal cards grid, 2 columns on mobile, 3 on desktop
- Top-up action opens a modal (select wallet, enter amount)
- Withdraw action requires confirmation modal

### `/reports`
- Period filter at top, applies to all charts
- Charts stacked vertically: cashflow → category breakdown → net worth
- Export buttons: "Export PDF" and "Export Excel" — top-right of page

### `/settings`
- Sections: Profil (name, avatar), Kategori (list with add/edit/delete)
- Kategori grouped by type: Pengeluaran / Pemasukan

### `/admin/users`
- Table with columns: Nama, Email, Role, Status, Dibuat, Aksi
- "+ Buat Pengguna" button top-right
- Row actions: icon buttons for suspend/unsuspend, reset password, delete
- Delete always shows confirmation modal with user name

### `/admin/audit-log`
- Table: Waktu, Admin, Aksi, Target, Detail
- Filter by: admin name, action type, date range
- Read-only — no actions

---

## Empty, Loading & Error States

Every data surface must implement all three states:

| State | Treatment |
|-------|-----------|
| Loading | Skeleton placeholder matching component shape, animated pulse |
| Empty | Centered illustration (simple SVG) + descriptive label + CTA if applicable |
| Error | `danger` colored alert banner + retry button |

- Skeleton: `bg-[surface-hover] animate-pulse rounded`
- Never show a blank white/dark space without explanation
- Empty state copy examples:
  - Transactions: "Belum ada transaksi. Mulai catat pemasukan atau pengeluaran kamu."
  - Wallets: "Belum ada dompet. Tambahkan dompet pertama kamu."
  - Debts: "Tidak ada hutang aktif."
  - Goals: "Belum ada tujuan tabungan."

---

## Accessibility

- WCAG 2.2 AA compliance required
- Minimum contrast ratio: 4.5:1 for normal text, 3:1 for large text and UI components
- All interactive elements: visible `focus-visible` ring using `ring-2 ring-[primary] ring-offset-2 ring-offset-[surface]`
- Touch targets: minimum 44×44px
- Semantic HTML first — use `<button>`, `<nav>`, `<main>`, `<section>`, `<table>` correctly before adding ARIA
- Form inputs: always paired with `<label>` via `htmlFor` / `id`
- Currency amounts: wrap in `<span aria-label="Rp 1.500.000">` for screen readers — the formatted string alone is sufficient
- Charts: must include a `<caption>` or `aria-label` describing the chart, and a data table alternative for screen readers
- Reduced motion: wrap all CSS transitions/animations in `@media (prefers-reduced-motion: no-preference)`
- Color must never be the sole differentiator — pair with icon, label, or pattern (e.g. income/expense not just green/red, also +/− prefix)

### Testable Acceptance Criteria
- [ ] Tab order follows logical reading flow on all pages
- [ ] All buttons and links have visible focus ring
- [ ] All form fields have associated labels
- [ ] All charts have an `aria-label` or `<caption>`
- [ ] Color contrast passes on all text/background combinations
- [ ] Touch targets ≥ 44px on mobile breakpoint
- [ ] Destructive actions require keyboard-accessible confirmation

---

## Writing Tone & Copy Standards

- Language: Bahasa Indonesia for all UI labels, messages, and copy
- Tone: friendly, direct, non-alarming — users are looking at personal finances, avoid panic-inducing language
- Currency: always "Rp 1.500.000" format — never "IDR", never "1500000"
- Dates: Indonesian format — "12 Januari 2025", abbreviated "12 Jan 2025"
- Verb style for CTAs: imperative — "Tambah Dompet", "Catat Transaksi", "Buat Pengguna"
- Error messages: explain what happened + what the user can do — never just "Error"

**Examples:**
- ✅ "Gagal menyimpan transaksi. Coba lagi atau periksa koneksi internet kamu."
- ❌ "Error 500"
- ✅ "Dompet berhasil ditambahkan."
- ❌ "Success"
- ✅ "Hapus pengguna ini? Tindakan ini tidak dapat dibatalkan."
- ❌ "Are you sure?"

---

## Anti-Patterns

| Prohibited | Reason |
|-----------|--------|
| Raw hex colors inline | Breaks token consistency and dark mode |
| Showing financial data in admin routes | Security requirement — no exceptions |
| Float for currency values | Floating point precision errors on money |
| Hyphen `-` as minus sign in currency | Use proper minus sign `−` (U+2212) |
| Color-only status indicators | Fails accessibility — pair with text/icon |
| Skipping confirmation on destructive actions | Users cannot undo delete/suspend |
| Mixing `id-ID` and `en-US` date/number formats | Inconsistent locale experience |
| Large amounts without thousand separators | "Rp 1500000" is unreadable |
| Admin seeing `/dashboard` financial page | Role guard must redirect |
| Empty states with no explanation | Users don't know if it's a bug or expected |

---

## QA Checklist

Run this checklist in code review for every new component or page:

### Visual
- [ ] Uses only design tokens (no raw hex/px/font values)
- [ ] Dark theme renders correctly — no light backgrounds bleeding through
- [ ] Loading, empty, and error states are implemented
- [ ] Currency amounts use mono font and correct formatting
- [ ] Semantic color used correctly (income=green, expense=red, etc.)

### Interaction
- [ ] All buttons have hover, focus, active, disabled states
- [ ] Destructive actions have confirmation modal
- [ ] Forms validate inline before submit
- [ ] Mobile touch targets ≥ 44px

### Data
- [ ] Amount stored as `numeric(15,2)`, never float
- [ ] Date stored as `date`, displayed in `id-ID` locale
- [ ] RLS enforced — user cannot access another user's data
- [ ] Admin routes have no access to financial tables

### Accessibility
- [ ] Focus order is logical
- [ ] All form inputs have labels
- [ ] All images/icons have alt text or `aria-hidden`
- [ ] Charts have accessible description
- [ ] No color-only indicators

### Responsive
- [ ] Tested at 375px, 768px, 1280px
- [ ] Sidebar collapses correctly on mobile
- [ ] Tables scroll horizontally on mobile (no layout break)
- [ ] FAB visible and tappable on mobile

<!-- TYPEUI_SH_MANAGED_END -->
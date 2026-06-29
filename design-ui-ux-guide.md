# Design System & UI/UX Guide

**Universal Guide for Modern Web Applications**
**Stack:** React/Next.js · Tailwind CSS · TypeScript
**Style:** Clean, Minimal, Component-First

---

## Table of Contents

1. [Design Tokens System](#1-design-tokens-system)
2. [Typography System](#2-typography-system)
3. [Color System](#3-color-system)
4. [Spacing & Layout](#4-spacing--layout)
5. [Component Architecture](#5-component-architecture)
6. [Component Style Guide](#6-component-style-guide)
7. [Page Anatomy Standards](#7-page-anatomy-standards)
8. [Form & Modal Patterns](#8-form--modal-patterns)
9. [Responsive Behavior](#9-responsive-behavior)
10. [Accessibility Standards](#10-accessibility-standards)
11. [Animation & Transitions](#11-animation--transitions)
12. [AI Agent Design Contract](#12-ai-agent-design-contract)

---

## 1. Design Tokens System

Design tokens are the single source of truth for design values. Define them once, use everywhere.

### 1.1 Token Organization

**Where to define tokens:**
```css
/* globals.css or tailwind.config.js */
@theme {
  /* Spacing */
  --spacing-1: 4px;
  --spacing-2: 8px;
  --spacing-3: 12px;
  --spacing-4: 16px;
  --spacing-6: 24px;
  --spacing-8: 32px;
  --spacing-12: 48px;
  --spacing-16: 64px;

  /* Typography */
  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-base: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 24px;
  --font-size-2xl: 32px;

  /* Colors */
  --color-primary: #000000;
  --color-secondary: #666666;
  --color-accent: #5c6bc0;
  --color-success: #4caf7d;
  --color-warning: #d48c3a;
  --color-danger: #e05c5c;

  /* Borders */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-full: 9999px;
}
```

### 1.2 Token Naming Convention

**Pattern:** `--{category}-{property}-{variant}`

```css
/* Good examples */
--color-text-primary
--color-bg-elevated
--spacing-gap-section
--radius-button

/* Bad examples */
--blue1                    /* Too generic */
--spacing-12               /* Missing context */
--textColor                /* Inconsistent casing */
```

---

## 2. Typography System

### 2.1 Type Scale

Establish a clear hierarchy with consistent sizes:

| Token | Size | Weight | Line Height | Use Case |
|-------|------|--------|-------------|----------|
| `display` | 32-48px | 700 | 1.1 | Hero headings |
| `h1` | 24-28px | 700 | 1.2 | Page titles |
| `h2` | 18-20px | 600 | 1.3 | Section titles |
| `h3` | 15-16px | 600 | 1.4 | Card titles |
| `body` | 14-16px | 400 | 1.5-1.6 | Body text |
| `small` | 12-13px | 400 | 1.4-1.5 | Captions, labels |

**Implementation:**
```css
/* Utility classes */
.text-display { font-size: var(--font-size-2xl); font-weight: 700; }
.text-h1 { font-size: var(--font-size-xl); font-weight: 700; }
.text-h2 { font-size: var(--font-size-lg); font-weight: 600; }
.text-h3 { font-size: var(--font-size-base); font-weight: 600; }
.text-body { font-size: var(--font-size-sm); font-weight: 400; }
.text-small { font-size: var(--font-size-xs); font-weight: 400; }
```

### 2.2 Font Families

```css
/* Recommended setup */
--font-sans: 'Inter', system-ui, sans-serif;     /* UI elements */
--font-serif: 'Merriweather', Georgia, serif;   /* Long-form content */
--font-mono: 'JetBrains Mono', monospace;        /* Code, numbers */
```

**Usage guidelines:**
- Use **sans-serif** for UI elements, buttons, labels
- Use **serif** for articles, long-form content (optional)
- Use **monospace** for code, data, numbers, metrics

### 2.3 Number Display

**All currency amounts and metrics should use monospace:**
```tsx
// ✅ CORRECT
<span className="font-mono">{formatCurrency(amount)}</span>
<span className="font-mono">1,234.56</span>

// ❌ FORBIDDEN
<span>{formatCurrency(amount)}</span>  // Missing monospace
```

---

## 3. Color System

### 3.1 Color Palette Structure

Organize colors into semantic categories:

```css
/* Neutral Colors (Grayscale) */
--color-gray-50: #fafafa;
--color-gray-100: #f5f5f5;
--color-gray-200: #e5e5e5;
--color-gray-300: #d4d4d4;
--color-gray-400: #a3a3a3;
--color-gray-500: #737373;
--color-gray-600: #525252;
--color-gray-700: #404040;
--color-gray-800: #262626;
--color-gray-900: #171717;

/* Semantic Colors */
--color-primary: #000000;        /* Main brand color */
--color-accent: #5c6bc0;         /* Accent/secondary */
--color-success: #4caf7d;        /* Positive states */
--color-warning: #d48c3a;        /* Warning states */
--color-danger: #e05c5c;         /* Error states */
--color-info: #3b82f6;           /* Information */
```

### 3.2 Background & Surface System

Create depth through layered backgrounds:

```css
/* Layer System */
--color-bg-base: #ffffff;         /* Layer 0 - Page background */
--color-bg-elevated: #f9f9f9;     /* Layer 1 - Cards, panels */
--color-bg-overlay: #f3f3f3;      /* Layer 2 - Dropdowns, popovers */
--color-bg-subtle: #efefef;       /* Layer 3 - Hover states */
```

**Usage:**
```tsx
// Page background
<body className="bg-base">

// Cards
<div className="bg-elevated border rounded-lg p-4">

// Hover states
<div className="hover:bg-subtle transition-colors">

// Dropdowns
<div className="bg-overlay border rounded-lg shadow-sm">
```

### 3.3 Text Color System

Use opacity-based text for automatic theming:

```css
/* On light backgrounds */
--color-text-primary: rgba(0, 0, 0, 0.87);   /* Main text */
--color-text-secondary: rgba(0, 0, 0, 0.60);  /* Descriptions */
--color-text-tertiary: rgba(0, 0, 0, 0.40);   /* Disabled, placeholders */

/* On dark backgrounds (if supporting dark mode) */
--color-text-primary-dark: rgba(255, 255, 255, 0.87);
--color-text-secondary-dark: rgba(255, 255, 255, 0.60);
--color-text-tertiary-dark: rgba(255, 255, 255, 0.40);
```

### 3.4 Border System

```css
--color-border-default: rgba(0, 0, 0, 0.08);   /* Standard borders */
--color-border-strong: rgba(0, 0, 0, 0.15);   /* Hover/focus */
--color-border-focus: rgba(0, 0, 0, 0.50);     /* Active inputs */
```

### 3.5 ❌ FORBIDDEN: Hardcoded Colors

```tsx
// ❌ NEVER use hex colors inline
<div style={{ color: "#f59e0b" }} />
<div className="bg-[#10b981]">
<div className="text-[#e05c5c]">

// ✅ ALWAYS use semantic tokens
<div className="text-warning">
<div className="bg-success">
<div className="border-primary">
```

---

## 4. Spacing & Layout

### 4.1 Spacing Scale (4px/8px Base)

| Token | Value | Use Case |
|-------|-------|----------|
| `spacing-1` | 4px | Icon-label gaps |
| `spacing-2` | 8px | Button groups, label-input |
| `spacing-3` | 12px | Small component gaps |
| `spacing-4` | 16px | Card padding, form gaps |
| `spacing-6` | 24px | Section gaps |
| `spacing-8` | 32px | Component group gaps |
| `spacing-12` | 48px | Large section gaps |
| `spacing-16` | 64px | Page margins |

**Tailwind equivalents:**
```tsx
className="p-4"     // 16px
className="gap-2"   // 8px
className="space-y-6" // 24px vertical
```

### 4.2 Layout Standards

**Page Structure:**
```tsx
<div className="min-h-screen bg-base">
  <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
    {/* Page content */}
  </div>
</div>
```

**Grid Patterns:**
```tsx
{/* 2-column grid */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">

{/* 3-column grid */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

{/* Responsive grid */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
```

---

## 5. Component Architecture

### 5.1 Atomic Design Hierarchy

```
Atoms (Basic elements)
  ↓
Molecules (Simple combinations)
  ↓
Organisms (Complex assemblies)
  ↓
Templates (Layout structures)
  ↓
Pages (Contextual implementations)
```

### 5.2 Component Categories

**Atoms (`components/ui/atoms/`)**
- Definition: Elements that cannot be broken down further
- Examples: Button, Input, Select, Checkbox, Badge, Icon, Spinner
- Characteristics: Stateless, accept props, render UI

**Molecules (`components/ui/molecules/`)**
- Definition: Combinations of 2-3 atoms
- Examples: FormField, SearchBox, TabButton, Tooltip, Toast
- Characteristics: Simple state, basic interactions

**Organisms (`components/ui/organisms/`)**
- Definition: Complex components with multiple molecules
- Examples: Modal, DataTable, FilterBar, Navbar, Sidebar
- Characteristics: Complex state, orchestration

---

## 6. Component Style Guide

### 6.1 Card Components

**Standard Card Structure:**
```tsx
<div className="bg-elevated border border-default rounded-lg p-4 hover:border-strong transition-colors">
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-full bg-subtle flex items-center justify-center">
      <Icon className="w-5 h-5" />
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="text-h3 truncate">Title</h3>
      <p className="text-small text-secondary truncate">Subtitle</p>
    </div>
  </div>
</div>
```

**Card Standards:**
- Background: `bg-elevated`
- Border: `border border-default`
- Radius: `rounded-lg` (8px)
- Padding: `p-4` (16px)
- Hover: `hover:border-strong` or `hover:bg-subtle`

### 6.2 Button Components

**Button Size Standards:**

| Size | Height | Padding | Use Case |
|------|--------|---------|----------|
| `sm` | 32-36px | 6-12px | Compact, tables |
| `md` | 40-44px | 8-16px | Default (recommended) |
| `lg` | 48-52px | 12-20px | Prominent CTAs |

**✅ Minimum touch target: 44x44px for mobile**

**Button Variants:**
```tsx
// Primary — Main action
<Button variant="primary">Submit</Button>
// bg-primary, text-on-primary

// Secondary — Cancel, go back
<Button variant="secondary">Cancel</Button>
// border, bg-transparent

// Ghost — Minimal action
<Button variant="ghost">Close</Button>
// no border, transparent

// Danger — Destructive
<Button variant="danger">Delete</Button>
// bg-danger, text-white
```

### 6.3 Input Components

**Input Standards:**
```tsx
<Input
  className="w-full min-h-[44px]"    // Consistent height
  placeholder="Enter text..."
/>
```

**Input States:**
| State | Border | Background | Cursor |
|-------|--------|------------|--------|
| Default | `border-default` | `bg-base` | default |
| Hover | `border-strong` | `bg-base` | pointer |
| Focus | `border-focus` | `bg-base` | text |
| Error | `border-danger` | `bg-base` | text |
| Disabled | `border-default` | `bg-subtle` | not-allowed |

### 6.4 Modal Components

**Modal Spacing Standards:**
```tsx
<Modal isOpen={isOpen} onClose={onClose}>
  {/* Header: 16px H, 12px V */}
  <div className="px-4 py-3 border-b">
    <h2 className="text-h2">Title</h2>
  </div>
  
  {/* Body: Responsive H, 16px V, scrollable */}
  <div className="px-4 sm:px-6 py-4 max-h-[60vh] overflow-y-auto">
    {/* Content */}
  </div>
  
  {/* Footer: Responsive H, 12px V */}
  <div className="px-4 sm:px-6 py-3 border-t flex justify-end gap-2">
    <Button variant="secondary">Cancel</Button>
    <Button variant="primary">Save</Button>
  </div>
</Modal>
```

---

## 7. Page Anatomy Standards

### 7.1 List Page Structure

**Standard component order (NON-NEGOTIABLE):**
```
1. Page Header (title + CTA)
2. Summary/Info Cards (optional)
3. Filter & Sort Bar
4. Content List/Grid
5. Pagination/Load More
6. Modals (rendered at bottom)
```

**Example:**
```tsx
export default function ProductsPage() {
  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        title="Products"
        actions={<Button>+ Add Product</Button>}
      />
      
      {/* 2. Summary (optional) */}
      <SummaryCards />
      
      {/* 3. Filters */}
      <ProductFilters />
      
      {/* 4. Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
      
      {/* 5. Pagination */}
      <Pagination />
      
      {/* 6. Modals */}
      <ProductModals />
    </div>
  );
}
```

### 7.2 Detail Page Structure

```
1. Navigation Bar (← Back + Actions)
2. Hero Summary Card (optional, with emphasis)
3. Content Sections
4. Related Content (optional)
5. Danger Zone (Delete button at bottom)
```

### 7.3 Form Page Structure

```
1. Page Header (Title + Cancel button)
2. Form Sections (grouped by context)
3. Form Footer (Fixed: Cancel + Save)
```

---

## 8. Form & Modal Patterns

### 8.1 Form Field Grouping

**Group related fields:**
```tsx
<form className="space-y-6">          {/* 24px between groups */}
  {/* Group 1: Basic Info */}
  <div className="space-y-4">        {/* 16px between fields */}
    <FormField label="Name" required />
    <FormField label="Email" type="email" required />
  </div>
  
  {/* Group 2: Additional Info */}
  <div className="space-y-4">
    <FormField label="Phone" type="tel" />
    <FormField label="Address" />
  </div>
</form>
```

### 8.2 Form Validation

**Visual feedback:**
```tsx
<FormField
  label="Email"
  value={email}
  onChange={setEmail}
  error={errors.email}    // Shows error message + red border
  required
/>
```

**Error display:**
- Show error message below field
- Red border on field
- Red text for error message

### 8.3 Modal Footer Pattern

**Standard footer structure:**
```tsx
<div className="flex justify-end gap-2">
  <Button variant="secondary" onClick={onCancel}>
    Cancel
  </Button>
  <Button variant="primary" onClick={onSave} disabled={isSubmitting}>
    {isSubmitting ? 'Saving...' : 'Save'}
  </Button>
</div>
```

**Rules:**
- Cancel on left, Save on right
- Disable Save during submission
- Show loading state in button text

---

## 9. Responsive Behavior

### 9.1 Breakpoint Standards

```tsx
// Mobile-first approach
<div className="
  grid-cols-1          /* Mobile: 1 column */
  sm:grid-cols-2       /* Small: 2 columns */
  md:grid-cols-2       /* Tablet: 2 columns */
  lg:grid-cols-3       /* Desktop: 3 columns */
  xl:grid-cols-4       /* Wide: 4 columns */
">
```

### 9.2 Component Responsive Rules

**Cards:**
- Mobile: 1 column
- Tablet (640px+): 2 columns
- Desktop (1024px+): 3 columns

**Modals:**
- Mobile: Bottom sheet (full width, rounded top)
- Tablet+: Centered (max-w-lg)

**Navigation:**
- Mobile: Hamburger menu or bottom tabs
- Desktop: Sidebar or top nav

### 9.3 Touch Targets

**✅ Minimum 44x44px for all interactive elements**

```tsx
// ✅ CORRECT
<Button className="min-h-[44px] min-w-[44px]">
<button className="p-4">                  // 16px padding = ~44px total

// ❌ WRONG
<Button className="h-8">                  // Too small
<button className="p-2">                  // Too small
```

---

## 10. Accessibility Standards

### 10.1 Color Contrast

- **WCAG AA requirement:** 4.5:1 for normal text, 3:1 for large text
- **WCAG AAA requirement:** 7:1 for normal text, 4.5:1 for large text
- Use opacity-based text system for guaranteed contrast

### 10.2 Focus States

**All interactive elements must have visible focus:**
```tsx
<Button className="focus:ring-2 focus:ring-focus">
<Input className="focus:border-focus focus:ring-1">
<a className="focus:ring-2 focus:ring-offset-2">
```

### 10.3 Screen Reader Support

```tsx
// Use semantic HTML
<button>           // ✅ Correct
<div role="button"> // ❌ Avoid when possible

// Provide labels
<input aria-label="Search products" />
<button aria-label="Close modal">×</button>

// Announce changes
<div role="status" aria-live="polite">
  {errorMessage}
</div>
```

### 10.4 Keyboard Navigation

- All functionality must be accessible via keyboard
- Tab order should follow visual layout
- Escape closes modals
- Enter submits forms

---

## 11. Animation & Transitions

### 11.1 Transition Standards

**Use consistent timing:**
```css
/* Fast interactions (hover, focus) */
transition-fast: 150ms ease

/* Standard transitions */
transition-base: 200ms ease

/* Slow transitions (modals, pages) */
transition-slow: 300ms ease
```

**Implementation:**
```tsx
// Tailwind classes
className="transition-all duration-150 ease"

// CSS variables
transition: color var(--transition-fast) ease;
```

### 11.2 Animation Guidelines

**❌ AVOID:**
- Large layout shifts
- Jarring movements
- Distracting animations

**✅ USE:**
- Subtle opacity fades
- Smooth color transitions
- Gentle scale changes
- Purposeful motion (guides attention)

### 11.3 Reduced Motion

**Respect user preferences:**
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 12. AI Agent Design Contract

### 12.1 Pre-Generation Checklist

Copy this template before generating any UI:

```
DESIGN SYSTEM CONTRACT

STYLE: Clean, minimal, component-first
- Border-based separation (minimal shadows)
- Consistent spacing (4px/8px base)
- Rounded corners: 4-8px (never 16px+ on standard elements)
- All transitions: 150-200ms ease

COLOR RULES:
- ❌ NEVER use hardcoded hex/rgba in JSX
- ✅ ALWAYS use semantic color tokens
- ✅ Use opacity-based text for automatic contrast

TYPOGRAPHY:
- ❌ NEVER use text-[10px], text-[24px]
- ✅ ALWAYS use utility classes (text-small, text-h1, etc.)
- ✅ Numbers/currency: ALWAYS use font-mono

COMPONENT RULES:
- Check existing library before creating new components
- Cards: bg-elevated, border, rounded-lg, p-4
- Buttons: min-h-[44px] for mobile
- Inputs: min-h-[44px] for mobile
- Modals: Fixed header/footer, scrollable body

SPACING:
- Use Tailwind spacing scale (4, 8, 12, 16, 24, 32, 48, 64)
- Page sections: space-y-6 (24px) or space-y-8 (32px)
- Form fields: space-y-4 (16px)
- Card grids: gap-6 (24px)

PAGE ANATOMY (STRICT ORDER):
1. PageHeader (title + CTA right-aligned)
2. Summary Cards (optional, below header)
3. Filter Bar (below summary, above list)
4. Content Grid (responsive cols)
5. Pagination/Modals

FORBIDDEN PATTERNS:
- Creating Button/Input when they exist in library
- Hardcoded colors: NO hex, NO rgba in JSX
- Hardcoded sizes: NO text-[10px], NO p-[16px]
- Large border-radius on non-special elements
- Shadow on cards (use borders instead)

SHARED COMPONENTS TO USE FIRST:
- <PageHeader /> for page titles
- <FormField /> for form fields
- <Modal /> base component
- <EmptyState /> for no-data states
```

### 12.2 Post-Generation Validation

Check generated code for:

- [ ] No hardcoded colors (use tokens/Tailwind classes)
- [ ] No hardcoded sizes (use utilities)
- [ ] All numbers use monospace font
- [ ] Cards use consistent styling
- [ ] Buttons meet 44px minimum
- [ ] Form fields use FormField component
- [ ] Page anatomy follows standard order
- [ ] Border radius ≤ 8px (unless special)
- [ ] Touch targets meet 44px minimum
- [ ] Focus states are visible

---

*This guide provides universal standards for modern UI design. Adapt patterns to your specific design system and brand requirements.*

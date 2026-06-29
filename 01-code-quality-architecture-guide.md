# Code Quality & Architecture Guide

**Stack:** Next.js / React (TypeScript) · Modern Web Development
**Version:** 3.0 — Universal Edition
**Audience:** AI Agents & Human Developers

---

## Table of Contents

1. [Core Principles](#1-core-principles)
2. [Project Structure Standards](#2-project-structure-standards)
3. [Feature-Based Architecture](#3-feature-based-architecture)
4. [Component Organization](#4-component-organization)
5. [Hook Patterns](#5-hook-patterns)
6. [File Splitting Rules](#6-file-splitting-rules)
7. [Design System Integration](#7-design-system-integration)
8. [TypeScript Standards](#8-typescript-standards)
9. [Security Standards](#9-security-standards)
10. [API Integration Patterns](#10-api-integration-patterns)
11. [Anti-Patterns (Forbidden)](#11-anti-patterns-forbidden)
12. [AI Agent Checklist](#12-ai-agent-checklist)

---

## 1. Core Principles

These principles are **non-negotiable** and apply to every file, function, and pull request.

| # | Principle | One-Line Rule |
|---|-----------|---------------|
| P1 | **Secure by Default** | Never trust input; validate, sanitize, and authorize everything. |
| P2 | **DRY** | If you write the same logic twice, extract it. |
| P3 | **Single Responsibility** | One file = one concern. One function = one job. |
| P4 | **Explicit over Implicit** | Name things clearly; avoid magic values and hidden side effects. |
| P5 | **Small Units** | Functions ≤ 30 lines. Files ≤ 200 lines (hard limit: 300). |
| P6 | **Fail Loudly** | Return errors; never silently swallow them. |
| P7 | **Testable** | Every public function must be unit-testable without mocks of internals. |
| P8 | **Design System First** | Always check existing component library before creating new components. |
| P9 | **Feature Isolation** | Each feature is self-contained with its own components, hooks, types. |

---

## 2. Project Structure Standards

### 2.1 Next.js App Router Structure

```
app/
├── (app)/                        # Main app routes (authenticated)
│   ├── [feature]/                # Feature folders
│   │   ├── components/           # Feature-specific components
│   │   ├── hooks/                # Feature-specific hooks
│   │   ├── types.ts              # Feature types
│   │   ├── utils.ts              # Feature utilities
│   │   └── page.tsx              # Route entry
│   └── layout.tsx                # Layout for route group

├── (auth)/                       # Auth routes group
├── (public)/                     # Public routes group
└── layout.tsx                    # Root layout

components/
├── ui/                           # Design system (Atomic Design)
│   ├── atoms/                    # Basic elements
│   ├── molecules/                # Component combinations
│   └── organisms/                # Complex components
└── [feature]/                    # Feature-specific shared components

lib/
├── [api]/                        # API clients (supabase, fetch, etc.)
├── utils/                        # Shared utilities
└── constants/                    # Shared constants

hooks/                            # Shared custom hooks
types/                            # Shared TypeScript types
styles/                           # Global styles
```

### 2.2 Pages Router Structure (Alternative)

```
pages/
├── api/                          # API routes
├── [feature]/
│   ├── index.tsx                 # List page
│   ├── [id].tsx                 # Detail page
│   ├── new.tsx                  # Create page
│   └── components/              # Feature components
└── _app.tsx / _document.tsx      # Special files
```

---

## 3. Feature-Based Architecture

### 3.1 Feature Structure Template

Each feature should follow a consistent internal structure:

```
[feature-folder]/
├── page.tsx                      # List page (main entry)
├── [id]/                         # Detail page
│   └── page.tsx
├── components/                   # Feature components
│   ├── modals/                   # Modal components
│   ├── [Feature]Card.tsx         # Card component
│   ├── [Feature]Filters.tsx      # Filter components
│   └── [Feature]Modals.tsx       # Modal exports
├── hooks/                        # Feature hooks
│   ├── use[Feature]State.ts      # UI state management
│   ├── use[Feature]Data.ts       # Data fetching (optional)
│   └── use[Feature]Handlers.ts   # Event handlers
├── types.ts                      # Feature types
└── utils.ts                      # Feature utilities
```

### 3.2 Feature Hook Pattern

**Standard Three-File Pattern:**

| Hook File | Purpose | Returns |
|-----------|---------|---------|
| `use[Feature]State.ts` | UI state, modals, filters | State values + setters |
| `use[Feature]Data.ts` | Data fetching, CRUD | Data + loading + error |
| `use[Feature]Handlers.ts` | Event handlers, mutations | Handler functions |

**Example:**

```typescript
// hooks/useProductsState.ts
export function useProductsState() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  return {
    searchTerm, selectedCategory, isCreateModalOpen, editingProduct,
    setSearchTerm, setSelectedCategory, setIsCreateModalOpen, setEditingProduct,
  };
}

// hooks/useProductsHandlers.ts
export function useProductsHandlers(onSuccess: () => void, onError: (error: Error) => void) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const createProduct = async (product: CreateProductDto) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.post('/products', product);
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create';
      setError(message);
      onError(new Error(message));
    } finally {
      setIsLoading(false);
    }
  };
  
  return { isLoading, error, createProduct };
}
```

---

## 4. Component Organization

### 4.1 Atomic Design Structure

**`components/ui/atoms/`** — Basic elements (stateless, reusable)
- Examples: Button, Input, Select, Badge, Spinner, ProgressBar, etc.
- Characteristics: No complex state, accepts props, renders UI

**`components/ui/molecules/`** — Component combinations
- Examples: FormField, ModalFooter, PageHeader, TabButton, Toast, Tooltip, etc.
- Characteristics: Combines 2+ atoms, handles simple interactions

**`components/ui/organisms/`** — Complex components
- Examples: Modal, FormModal, DataTable, EmptyState, FilterBar, etc.
- Characteristics: Complex state, orchestrates molecules/atoms

### 4.2 Component Naming Rules

| Type | Pattern | Example |
|------|---------|---------|
| Feature card | `<Feature>Card.tsx` | `ProductCard.tsx`, `UserCard.tsx` |
| Feature list | `<Feature>List.tsx` | `ProductList.tsx` |
| Feature modal | `<Action><Feature>Modal.tsx` | `CreateProductModal.tsx` |
| Feature filter | `<Feature>Filters.tsx` | `ProductFilters.tsx` |
| Feature skeleton | `<Feature>Skeleton.tsx` | `ProductSkeleton.tsx` |

**❌ AVOID abbreviations:**
- ❌ `ProdCard.tsx` → ✅ `ProductCard.tsx`
- ❌ `AddProdModal.tsx` → ✅ `AddProductModal.tsx`
- ❌ `UsrList.tsx` → ✅ `UserList.tsx`

---

## 5. Hook Patterns

### 5.1 Custom Hook Rules

**Hook Naming:**
```typescript
// ✅ CORRECT — use + noun phrase
useUserData()
useFormState()
useModalState()

// ❌ WRONG — not starting with "use"
getUserData()
formData()
modalState()
```

**Hook Organization:**
```typescript
// ✅ CORRECT — Separated by concern
hooks/useProductsState.ts     // UI state only
hooks/useProductsHandlers.ts  // Side effects only
hooks/useProductsData.ts      // Data fetching only

// ❌ WRONG — Everything in one file
hooks/useProducts.ts          // 500+ lines, mixed concerns
```

### 5.2 Common Hook Patterns

**Modal Hook:**
```typescript
export function useModal(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);
  
  return { isOpen, open, close, toggle };
}
```

**Form Hook:**
```typescript
export function useForm<T>(initialValues: T) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const setValue = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setValues(prev => ({ ...prev, [key]: value }));
  }, []);
  
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);
  
  return { values, errors, isSubmitting, setIsSubmitting, setValue, reset };
}
```

---

## 6. File Splitting Rules

### 6.1 Hard Limits

| Unit | Soft Limit | Hard Limit | Action when exceeded |
|------|-----------|------------|----------------------|
| Lines per file | 200 | 300 | Split into sub-files |
| Lines per function | 20 | 30 | Extract helper functions |
| Parameters per function | 3 | 4 | Use options object |
| Nesting depth | 3 | 4 | Extract or invert conditions |
| Imports per file | 15 | 20 | Likely a god file — split |

### 6.2 When to Split a File

**Split when:**
- File exceeds 200 lines
- File handles multiple concerns (UI + data fetching)
- Component has complex state (extract to hook)
- Multiple unrelated types in one file

**Page Splitting Example:**

**Before (300+ lines):**
```
page.tsx — render + state + handlers + modals
```

**After:**
```
page.tsx                          # Thin composition (~50 lines)
hooks/useFeatureState.ts          # State management
hooks/useFeatureHandlers.ts      # Event handlers
components/FeatureList.tsx       # Sub-components
components/modals/FeatureModal.tsx
```

---

## 7. Design System Integration

### 7.1 Design Token Usage

**❌ FORBIDDEN — Hardcoded values:**
```tsx
// ❌ Hardcoded sizes
className="text-[10px]"
className="text-[24px]"
className="p-[16px]"

// ❌ Hardcoded colors
<div style={{ color: "#f59e0b" }} />
<div className="bg-[#10b981]">
```

**✅ CORRECT — Use design tokens:**
```tsx
// ✅ Use utility classes
className="text-caption"
className="text-page-title"
className="p-4"

// ✅ Use CSS variables
className="bg-primary"
className="text-secondary"
```

### 7.2 Component Before Creating New

**❌ FORBIDDEN — Creating custom components when library has one:**
```tsx
// ❌ Custom button when Button exists
<button className="px-4 py-2 bg-blue-500 rounded">Click</button>

// ❌ Custom input when Input exists
<input className="w-full border p-2" />
```

**✅ CORRECT — Use existing components:**
```tsx
import { Button } from '@/components/ui/atoms';
import { Input } from '@/components/ui/atoms';

<Button variant="primary">Click</Button>
<Input className="w-full" />
```

### 7.3 Spacing Consistency

**Use Tailwind's spacing scale:**
```tsx
// ✅ Consistent spacing
className="p-4"           // 16px
className="gap-6"         // 24px
className="space-y-4"     // 16px vertical

// ❌ Arbitrary values
className="p-[16px]"
className="gap-[24px]"
```

---

## 8. TypeScript Standards

### 8.1 Type Safety Rules

**❌ FORBIDDEN:**
```typescript
const data: any = ...;
function process(input: any) {}
```

**✅ CORRECT:**
```typescript
// Use unknown for truly unknown data
function process(input: unknown) {
  if (typeof input !== 'string') throw new Error('Expected string');
  return input.trim();
}

// Use generics for reusable utilities
type ApiResponse<T> = {
  data: T;
  error: string | null;
};
```

### 8.2 Type Definition Patterns

**Feature Types File:**
```typescript
// types.ts (in feature folder or shared types)
export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProductDto {
  name: string;
  price: number;
  category: string;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}
```

### 8.3 Prop Types

```typescript
// ✅ Define interface for props
interface ProductCardProps {
  product: Product;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  variant?: 'default' | 'compact';
}

export function ProductCard({ product, onEdit, onDelete, variant = 'default' }: ProductCardProps) {
  // ...
}
```

---

## 9. Security Standards

### 9.1 Input Validation

```typescript
// ✅ Validate before processing
if (!input.name || input.name.trim().length === 0) {
  throw new Error('Name is required');
}

if (input.price <= 0) {
  throw new Error('Price must be positive');
}

// ✅ Sanitize output
const safeName = input.name.trim().slice(0, 100);
```

### 9.2 API Security

```typescript
// ✅ Use environment variables for secrets
const API_KEY = process.env.API_KEY;
if (!API_KEY) throw new Error('API_KEY is not set');

// ✅ Never expose secrets to client
// Server-side only!
const serviceClient = createServiceClient();
```

### 9.3 Authentication & Authorization

```typescript
// ✅ Check auth before processing
export function middleware(request: NextRequest) {
  const token = request.cookies.get('session')?.value;
  if (!token && isProtectedRoute(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

// ✅ Authorization check inside service
async function deletePost(postId: string, actorId: string): Promise<void> {
  const post = await postRepository.findById(postId);
  if (!post) throw new NotFoundError('Post not found');
  if (post.authorId !== actorId) throw new ForbiddenError('Not your post');
  await postRepository.delete(postId);
}
```

---

## 10. API Integration Patterns

### 10.1 API Client Organization

```typescript
// lib/api/client.ts — Base client setup
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
});

// lib/api/products.ts — Feature API
export const productsApi = {
  getAll: () => apiClient.get<Product[]>('/products'),
  getById: (id: string) => apiClient.get<Product>(`/products/${id}`),
  create: (data: CreateProductDto) => apiClient.post<Product>('/products', data),
  update: (id: string, data: UpdateProductDto) => 
    apiClient.patch<Product>(`/products/${id}`, data),
  delete: (id: string) => apiClient.delete(`/products/${id}`),
};
```

### 10.2 Error Handling Pattern

```typescript
const { data, error } = await apiCall();

if (error) {
  // Handle specific error codes
  if (error.code === '23505') {
    throw new Error('Item already exists');
  }
  if (error.status === 404) {
    throw new Error('Item not found');
  }
  throw new Error(`Operation failed: ${error.message}`);
}
```

---

## 11. Anti-Patterns (Forbidden)

### 11.1 God File / God Component

```
❌ A single file that:
   - Handles routing, business logic, and UI rendering
   - Defines more than 5 unrelated types
   - Has more than 300 lines

✅ Split by concern: one file = one job
```

### 11.2 Prop Drilling

```tsx
// ❌ BAD — passing props 3+ levels deep
<Page user={user}>
  <Dashboard user={user}>
    <Sidebar user={user}>
      <Avatar user={user} />
    </Sidebar>
  </Dashboard>
</Page>

// ✅ GOOD — use Context or state management
const UserContext = createContext<User | null>(null);
```

### 11.3 Any Type

```typescript
// ❌ BANNED
const response: any = await fetch(...);

// ✅ GOOD
const response: ApiResponse<User> = await fetch(...);
```

### 11.4 Swallowing Errors

```typescript
// ❌ BANNED
user, _ := repo.FindByID(ctx, id)

// ❌ BANNED in TypeScript
try { ... } catch { /* nothing */ }

// ✅ Always handle or propagate
```

### 11.5 Creating Components Before Checking Library

```tsx
// ❌ BAD — creating custom button/checking existing library first
// Always check components/ui/ atoms or molecules before creating new

// ✅ GOOD — search existing components first
// Does Button exist? Does StatusBadge exist? Use those!
```

### 11.6 Hardcoded Values

```tsx
// ❌ FORBIDDEN
if (retries > 3) { ... }
<div className="p-[16px]">...</div>

// ✅ GOOD
const MAX_RETRIES = 3;
<div className="p-4">...</div>
```

---

## 12. AI Agent Checklist

Before generating or modifying any code:

### Pre-generation
- [ ] Check if similar logic already exists (avoid DRY violations)
- [ ] For UI: Check if component exists in `components/ui/` library
- [ ] Identify correct file location per project structure
- [ ] Verify design system has needed tokens

### Code generation
- [ ] No function exceeds 30 lines
- [ ] No file exceeds 200 lines (hard cap: 300)
- [ ] No `any` types in TypeScript
- [ ] No hardcoded colors/sizes — use design tokens
- [ ] All inputs validated before use
- [ ] All errors handled or propagated
- [ ] Authorization checked before resource access
- [ ] No magic strings/numbers — use constants
- [ ] No commented-out code
- [ ] Existing components reused before creating new

### Post-generation
- [ ] New utility doesn't duplicate existing one
- [ ] File size within limits
- [ ] Design tokens used correctly
- [ ] Sensitive data never logged

---

## Quick Reference: Common Patterns

### Page Component Structure
```tsx
export default function FeaturePage() {
  // 1. State from hooks
  const { searchTerm, filteredItems, ... } = useFeatureState();
  
  // 2. Handlers
  const { createItem, isLoading } = useFeatureHandlers(onSuccess);
  
  // 3. Render
  return (
    <div className="space-y-6">
      <PageHeader title="Title" actions={<Button>Action</Button>} />
      <FeatureFilters searchTerm={searchTerm} />
      <div className="grid gap-6">
        {filteredItems.map(item => <FeatureCard item={item} />)}
      </div>
      <FeatureModals />
    </div>
  );
}
```

### Modal Component Structure
```tsx
export function FeatureModal({ isOpen, onClose, item }) {
  const { handleSubmit, isLoading } = useFeatureHandlers();
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Title"
      footer={<ModalFooter onCancel={onClose} isSubmitting={isLoading} />}
    >
      <div className="space-y-4">
        <FormField label="Field" value={value} onChange={onChange} />
      </div>
    </Modal>
  );
}
```

---

*This document provides universal standards for modern web development. Adapt patterns to your specific project context.*

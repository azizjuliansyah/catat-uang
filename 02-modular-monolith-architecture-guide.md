# Modular Monolith Architecture Guide

**Universal Edition — Applicable to Any Codebase**
**Stack:** Next.js / React (TypeScript) · Node.js · Golang
**Version:** 2.0 — Pragmatic & Flexible

---

## Table of Contents

1. [What is Modular Monolith?](#1-what-is-modular-monolith)
2. [When to Use This Pattern](#2-when-to-use-this-pattern)
3. [Module Anatomy](#3-module-anatomy)
4. [Dependency Rules](#4-dependency-rules)
5. [Communication Patterns](#5-communication-patterns)
6. [TypeScript Implementation](#6-typescript-implementation)
7. [Golang Implementation](#7-golang-implementation)
8. [Shared Layer Guidelines](#8-shared-layer-guidelines)
9. [Migration Strategy](#9-migration-strategy)
10. [Forbidden Patterns](#10-forbidden-patterns)

---

## 1. What is Modular Monolith?

A **Modular Monolith** is a single deployable unit whose internal code is organized into **self-contained modules** with **enforced boundaries**.

### Core Benefits

| Benefit | Description |
|---------|-------------|
| **Isolation** | Changing module A cannot break module B (unless public contract changes) |
| **Replaceability** | Any module's internals can be rewritten independently |
| **Independent testability** | Each module can be tested with mocked dependencies |
| **Clear ownership** | Every file belongs to exactly one module or shared |

### When You Need This

**✅ Good fit:**
- Medium to large applications (50+ files)
- Team of 3+ developers
- Domain with clear boundaries (e-commerce, SaaS, finance)
- Plan to extract microservices later

**❌ Not needed:**
- Small prototypes (< 30 files)
- Single developer projects
- Short-lived applications

### Visual Overview

```
┌─────────────────────────────────────────────┐
│              Application                    │
│                                             │
│  ┌───────────┐     contract    ┌────────────┐│
│  │  Module A │ ──────────────▶ │  Module B  ││
│  │ (users)   │                │ (orders)   ││
│  │           │                │            ││
│  │ [private] │                │ [private]  ││
│  └───────────┘                └────────────┘│
│       │                              │       │
│       └──────────┐     ┌───────────────┘   │
│                  ▼     ▼                  │
│            ┌──────────────┐              │
│            │   shared/    │              │
│            │  (utils)     │              │
│            └──────────────┘              │
└─────────────────────────────────────────────┘

Modules only see each other's public contracts.
```

---

## 2. When to Use This Pattern

### Comparison

| Approach | When to Use | Complexity |
|----------|-------------|------------|
| **Monolithic** | Small apps, fast iteration | Low |
| **Modular Monolith** | Medium apps, clear domains | Medium |
| **Microservices** | Large apps, independent scaling | High |

### Decision Tree

```
Start
 │
 ├─ App < 50 files? → Monolithic (skip this guide)
 │
 ├─ Single developer? → Modular Monolith (optional)
 │
 ├─ Clear domain boundaries? → Modular Monolith ✅
 │
 └─ Need independent scaling? → Microservices
```

### Pragmatic Approach

**This guide advocates for a pragmatic approach:**

- Start with feature folders
- Add module boundaries as complexity grows
- Don't over-engineer small applications
- Enforce boundaries via conventions first, tools second

---

## 3. Module Anatomy

### 3.1 TypeScript Module Structure

```
src/modules/<module-name>/
│
├── index.ts                    ← PUBLIC CONTRACT (only export)
│
├── types/
│   ├── <module>.types.ts       ← Public + internal types
│   └── <module>.dto.ts         ← Request/Response shapes
│
├── services/
│   └── <module>.service.ts     ← Business logic (private)
│
├── repositories/
│   └── <module>.repository.ts  ← Data access (private)
│
├── components/                 ← UI components (private)
│   ├── <Component>.tsx
│   └── index.ts                ← Re-exports
│
├── hooks/
│   └── use<Module>.ts          ← Data/state hooks (private)
│
├── utils/
│   └── <module>.utils.ts       ← Helpers (private)
│
└── __tests__/
    └── <module>.test.ts
```

### 3.2 Golang Module Structure

```
internal/modules/<module-name>/
│
├── contract.go                 ← PUBLIC: exported interfaces
├── handler.go                  ← HTTP handlers (private)
├── service.go                  ← Business logic (private)
├── repository.go               ← Data access (private)
├── model.go                    ← Domain models (private)
├── dto.go                      ← Request/Response DTOs
├── errors.go                   ← Module errors
└── module.go                   → Constructor/wire-up
```

### 3.3 Contract Examples

**TypeScript index.ts:**
```typescript
// src/modules/users/index.ts — PUBLIC CONTRACT ONLY

// Types
export type { User, UserRole } from './types/user.types';
export type { CreateUserDto, UpdateUserDto } from './types/user.dto';

// Service interface
export type { IUserService } from './services/user.service';

// Factory
export { getUserService } from './bootstrap';

// ❌ DO NOT EXPORT:
// - UserRepository implementation
// - Internal helper functions
// - Database models
```

**Golang contract.go:**
```go
// internal/modules/users/contract.go — PUBLIC CONTRACT

package users

// UserService is the public interface
type UserService interface {
    GetByID(ctx context.Context, id string) (*UserDTO, error)
    Create(ctx context.Context, req CreateUserRequest) (*UserDTO, error)
}

// UserDTO — safe, public-facing representation
type UserDTO struct {
    ID    string `json:"id"`
    Email string `json:"email"`
    Name  string `json:"name"`
}

// CreateUserRequest — input contract
type CreateUserRequest struct {
    Email string
    Name  string
}
```

---

## 4. Dependency Rules

### 4.1 Dependency Hierarchy

```
        ┌──────────────┐
        │   Module A   │  ← Can import: own files + shared + other contracts
        └──────┬───────┘
               │  only via contract
        ┌──────▼───────┐
        │   Module B   │  ← Can import: own files + shared + other contracts
        └──────┬───────┘
               │
        ┌──────▼───────┐
        │   shared/    │  ← Can import: own files only
        └───────────────┘
```

### 4.2 Import Rules

| From → | Own internals | Other internals | Other contract | shared/ |
|--------|--------------|-----------------|----------------|---------|
| **Module A** | ✅ | ❌ | ✅ | ✅ |
| **shared/** | ✅ | ❌ | ❌ | ✅ |
| **App pages** | Via contract only | ❌ | ✅ | ✅ |

### 4.3 The Golden Rule

> **You may ONLY import from another module's public contract (`index.ts` or exported interface). You may NEVER import from internal paths.**

```typescript
// ❌ FORBIDDEN — importing internals
import { UserServiceImpl } from '@/modules/users/services/user.service';
import { hashPassword } from '@/modules/auth/utils/auth.utils';

// ✅ CORRECT — importing from contract
import { getUserService, type User } from '@/modules/users';
```

```go
// ❌ FORBIDDEN — importing internals
import "myapp/internal/users/service"

// ✅ CORRECT — importing package (contract only)
import "myapp/internal/users"
```

---

## 5. Communication Patterns

### 5.1 Pattern A: Direct Contract Call (Synchronous)

**Use when:** Module B needs data from Module A immediately

**TypeScript:**
```typescript
// src/modules/orders/services/order.service.ts
import { getUserService, type User } from '@/modules/users';

export class OrderService {
  private userService = getUserService();

  async createOrder(userId: string, items: Item[]): Promise<Order> {
    // Call another module via contract
    const user = await this.userService.getById(userId);
    if (!user) throw new OrderError('User not found');

    return this.orderRepo.create({ userId: user.id, items });
  }
}
```

**Golang:**
```go
// internal/modules/orders/service.go
type OrderService struct {
    repo    OrderRepository
    userSvc users.UserService  // Depends on CONTRACT interface
}

func (s *OrderService) CreateOrder(ctx context.Context, userID string, items []Item) (*Order, error) {
    user, err := s.userSvc.GetByID(ctx, userID)
    if err != nil {
        return nil, fmt.Errorf("CreateOrder: %w", err)
    }
    return s.repo.Create(ctx, userID, items)
}
```

### 5.2 Pattern B: Domain Events (Asynchronous)

**Use when:** Module A notifies Module B without needing response

**TypeScript:**
```typescript
// shared/events/event-bus.ts
export interface DomainEvent<T = unknown> {
  type: string;
  payload: T;
  occurredAt: Date;
}

export interface EventBus {
  publish<T>(event: DomainEvent<T>): void;
  subscribe<T>(eventType: string, handler: (event: DomainEvent<T>) => void): void;
}

// Module A publishes
export class UserService {
  constructor(private eventBus: EventBus) {}

  async create(dto: CreateUserDto): Promise<User> {
    const user = await this.repo.create(dto);
    this.eventBus.publish({
      type: 'user.created',
      payload: { userId: user.id, email: user.email },
      occurredAt: new Date(),
    });
    return user;
  }
}

// Module B subscribes
eventBus.subscribe('user.created', async (event) => {
  await notificationService.sendWelcomeEmail(event.payload.email);
});
```

### 5.3 Pattern C: Shared Types (No Runtime Dependency)

**Use when:** Modules share type definitions only

```typescript
// shared/types/primitives.ts
export type UserID = string & { readonly _brand: 'UserID' };
export type Money = { amount: number; currency: string };

// Both modules import from shared
import type { Money } from '@/shared/types/primitives';
```

---

## 6. TypeScript Implementation

### 6.1 Module Bootstrap Pattern

```typescript
// src/modules/users/bootstrap.ts
import { UserServiceImpl } from './services/user.service';
import { UserRepositoryImpl } from './repositories/user.repository';
import type { IUserService } from './services/user.service';

let _userService: IUserService | null = null;

export function getUserService(): IUserService {
  if (!_userService) {
    const repo = new UserRepositoryImpl(db);
    _userService = new UserServiceImpl(repo);
  }
  return _userService;
}
```

### 6.2 Route Handler Pattern

```typescript
// src/app/api/users/[id]/route.ts
import { getUserService } from '@/modules/users';
import { UserNotFoundError } from '@/modules/users';

const userService = getUserService();

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await userService.getById(params.id);
    return Response.json({ data: user });
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

### 6.3 ESLint Boundary Rules (Optional)

```json
// .eslintrc.json
{
  "plugins": ["import"],
  "rules": {
    "import/no-restricted-paths": [
      "error",
      {
        "zones": [
          {
            "target": "./src/modules/orders",
            "from": "./src/modules/users",
            "except": ["./index.ts"],
            "message": "Import only from modules/users/index.ts"
          },
          {
            "target": "./src/shared",
            "from": "./src/modules",
            "message": "shared/ must not import from modules/"
          }
        ]
      }
    ]
  }
}
```

---

## 7. Golang Implementation

### 7.1 Module Constructor Pattern

```go
// internal/modules/users/module.go
package users

type Module struct {
    Service UserService
    Handler *Handler
}

func New(db *sql.DB) *Module {
    repo := newRepository(db)
    svc := newService(repo)
    handler := newHandler(svc)
    return &Module{
        Service: svc,
        Handler: handler,
    }
}
```

### 7.2 Application Wire-Up

```go
// cmd/api/main.go
func main() {
    db := infrastructure.NewDatabase(cfg.DatabaseURL)

    // Wire modules
    userModule := users.New(db)
    orderModule := orders.New(db, userModule.Service)

    // Register routes
    r := chi.NewRouter()
    r.Mount("/users", userModule.Handler.Routes())
    r.Mount("/orders", orderModule.Handler.Routes())
}
```

### 7.3 Interface Dependency

```go
// internal/modules/orders/service.go
type OrderService struct {
    repo    orderRepository
    userSvc users.UserService  // Depends on CONTRACT interface
}

func newService(repo orderRepository, userSvc users.UserService) *OrderService {
    return &OrderService{repo: repo, userSvc: userSvc}
}
```

---

## 8. Shared Layer Guidelines

### 8.1 What Belongs in shared/

**✅ Allowed:**

| Category | Examples |
|----------|----------|
| Generic utilities | formatDate, slugify, debounce |
| Generic hooks | useDebounce, useLocalStorage |
| Base components | Button, Input, Modal (unstyled) |
| HTTP client | apiFetch wrapper |
| Error classes | AppError, ValidationError |
| Type primitives | Nullable<T>, branded types |
| Event bus | EventBus infrastructure |
| Logger | Logger interface |

**❌ NOT Allowed:**

| What | Why |
|------|-----|
| Business logic | Belongs in a module |
| Domain-specific utils | Belongs in feature module |
| Domain events | Belongs in publishing module |

### 8.2 The Portability Test

> Can you move `shared/` into a completely different project and it still makes sense?

- **Yes** → It belongs in `shared/`
- **No** → It belongs in a specific module

---

## 9. Migration Strategy

### 9.1 From Monolith to Modular

**Phase 1: Organize by Feature**
```
Before:
app/
├── components/
├── hooks/
├── utils/
└── pages/

After:
app/
├── modules/
│   ├── users/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── page.tsx
│   ├── orders/
│   └── products/
```

**Phase 2: Extract Contracts**
```typescript
// Create index.ts for each module
// modules/users/index.ts
export type { User } from './types';
export { getUserService } from './bootstrap';
```

**Phase 3: Enforce Boundaries**
- Add ESLint rules (optional)
- Code review discipline
- Documentation

### 9.2 Incremental Approach

1. **Start small** — Apply to 1-2 modules first
2. **Learn patterns** — See what works for your team
3. **Expand gradually** — Add modules as needed
4. **Tooling last** — Add automation after patterns are established

---

## 10. Forbidden Patterns

### 10.1 Importing Internals

```typescript
// ❌ FORBIDDEN
import { UserService } from '@/modules/users/services/user.service';
import { hashPassword } from '@/modules/auth/utils/crypto.utils';

// ✅ CORRECT
import { getUserService } from '@/modules/users';
```

```go
// ❌ FORBIDDEN
import "myapp/internal/users/service"

// ✅ CORRECT
import "myapp/internal/users"
```

### 10.2 Circular Dependencies

```
❌ FORBIDDEN:
Module A → Module B contract
Module B → Module A contract

✅ Solution: Extract shared concept to shared/
```

### 10.3 Business Logic in shared/

```typescript
// ❌ FORBIDDEN in shared/
export function calculateDiscount(order: Order, user: User): number {
  // Business rule belongs in billing module
}

// ✅ CORRECT
// modules/billing/utils/discount.ts (private to module)
```

### 10.4 Exposing Internals

```typescript
// ❌ BAD contract — exports everything
export * from './services/user.service';
export * from './repositories/user.repo';

// ✅ GOOD contract — selective exports
export type { User } from './types/user.types';
export { getUserService } from './bootstrap';
```

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────┐
│              MODULAR MONOLITH — QUICK RULES              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  IMPORT RULES                                          │
│  ✅ Module → own files                                 │
│  ✅ Module → shared/                                   │
│  ✅ Module → other's index.ts / contract               │
│  ❌ Module → other's internal files                    │
│  ❌ shared/ → any module                               │
│                                                         │
│  CONTRACT RULES                                        │
│  ✅ Export: types, DTOs, service interface, factory    │
│  ❌ Export: impl classes, repos, internal utils       │
│                                                         │
│  COMMUNICATION                                         │
│  Sync dependency → Direct call via contract            │
│  Async side effect → Domain event via event bus        │
│  Shared primitive → shared/ type (no dependency)       │
│                                                         │
│  CHANGE SAFETY                                         │
│  Changing internals → Safe (no other module sees)       │
│  Changing contract → Must coordinate with consumers     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Pragmatic Advice

**This guide advocates flexibility:**

1. **Start simple** — Don't force module boundaries on small apps
2. **Add structure as needed** — Let complexity drive architecture
3. **Conventions over tools** — Team agreement > automation
4. **Iterate** — Refine as your understanding grows

**When to skip strict modularity:**

- Prototypes and MVPs
- Small teams (< 3 developers)
- Simple domains without clear boundaries
- Time-critical projects

**When to invest in modularity:**

- Growing teams
- Complex business domains
- Long-term maintenance needs
- Plans for future microservice extraction

---

*This guide provides patterns, not prescriptions. Adapt to your context.*

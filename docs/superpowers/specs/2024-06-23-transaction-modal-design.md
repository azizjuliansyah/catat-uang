# Transaction Modal System Design

**Date:** 2024-06-23
**Status:** Approved
**Approach:** Modular Component (Approach A)

---

## Overview

Convert transaction CRUD from page-based to modal-based system. Remove `/transactions/[id]` detail page, implement 3 new modals for create, edit, and detail view.

---

## Architecture

### New Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `CreateTransactionModal.tsx` | `app/(app)/transactions/components/` | Form for creating new transactions |
| `EditTransactionModal.tsx` | `app/(app)/transactions/components/` | Form for editing existing transactions |
| `TransactionDetailModal.tsx` | `app/(app)/transactions/components/` | Read-only view of transaction details |
| `TransactionListActions.tsx` | `app/(app)/transactions/components/` | Action buttons for each transaction list item |

### Component Relationships

```
TransactionList (existing)
    └── TransactionListActions (new)
            ├── Detail → TransactionDetailModal
            ├── Edit → EditTransactionModal
            └── Delete → DeleteConfirmationModal (existing)

Page Header (existing)
    └── "Transaksi Baru" button → CreateTransactionModal
```

---

## Component Specifications

### 1. CreateTransactionModal

**Props:**
```typescript
interface CreateTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // Refresh transactions list
}
```

**Fields:**
- Type: TabButton (Income/Expense)
- Amount: Currency input (Rp format)
- Date: datetime-local picker
- Source: CustomSelect (Wallets + Paylater platforms)
- Category: CategoryGridSelector
- Description: Textarea (optional)
- Receipt: File upload with preview

**Behavior:**
- Uses adapted `useNewTransactionState` and `useNewTransactionHandlers`
- On submit: create transaction → close modal → call `onSuccess`
- On cancel: close modal, discard unsaved changes

---

### 2. EditTransactionModal

**Props:**
```typescript
interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transaction: Transaction | null; // Pre-fill data
}
```

**Fields:** Same as CreateTransactionModal, pre-filled with transaction data.

**Behavior:**
- Fields populated from `transaction` prop
- On submit: update transaction → close modal → call `onSuccess`
- On cancel: close modal

---

### 3. TransactionDetailModal

**Props:**
```typescript
interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  formatIDR: (val: number) => string;
  formatDate: (date: string) => string;
}
```

**Content Layout (Read-only text, NOT input fields):**
```
┌───────────────────────────────────────────┐
│ 📝 Detail Transaksi                       │
├───────────────────────────────────────────┤
│                                           │
│ Jenis:     [Pemasukan/Pengeluaran]        │
│ Jumlah:    Rp 1.500.000                   │
│ Tanggal:   23 Juni 2024, 14:30            │
│ Sumber:    GoPay                          │
│ Kategori:  Makanan 🍔                     │
│ Deskripsi: Beli makan siang               │
│                                           │
│ Nota: [thumbnail] (klik untuk zoom)      │
│                                           │
│ Dibuat:   23 Juni 2024, 14:30            │
│ Diupdate: 23 Juni 2024, 14:35            │
│                                           │
└───────────────────────────────────────────┘
```

**Behavior:**
- All fields displayed as plain text
- Receipt shown as clickable thumbnail (opens full-size)
- No edit capability in this modal

---

### 4. TransactionListActions

**Props:**
```typescript
interface TransactionListActionsProps {
  transaction: Transaction;
  onDetail: () => void;
  onEdit: () => void;
  onDelete: () => void;
}
```

**UI:**
```
┌──────────────────────────────┐
│ [Detail] [Edit] [Delete]      │
│  📍      ✏️      🗑️          │
└──────────────────────────────┘
```

- Small/compact buttons
- Delete button uses `destructive` variant
- Hover effects on each button

---

## Hook Adaptations

### Current Hooks
- `useNewTransactionState` - manages form state
- `useNewTransactionHandlers` - handles form submission

### Required Changes
- Extract data fetching (wallets, categories, paylater) to be modal-independent
- Make hooks work without `useRouter` dependency
- Add `transaction` prop for pre-filling edit form
- Support both create and edit modes

---

## Bug Fix: Receipt Upload

**Issue:** Receipt images not being saved to database.

**Investigation Points:**
1. Check `handleFileChange` in `useNewTransactionHandlers`
2. Verify Supabase storage upload logic
3. Confirm `receipt_url` is being set in the transaction insert
4. Check if `handleRemoveReceipt` clears state properly

---

## Files to Modify

### New Files
- `app/(app)/transactions/components/CreateTransactionModal.tsx`
- `app/(app)/transactions/components/EditTransactionModal.tsx`
- `app/(app)/transactions/components/TransactionDetailModal.tsx`
- `app/(app)/transactions/components/TransactionListActions.tsx`
- `app/(app)/transactions/hooks/useTransactionFormState.ts` (adapted)
- `app/(app)/transactions/hooks/useTransactionFormHandlers.ts` (adapted)

### Modified Files
- `app/(app)/transactions/components/TransactionListGroup.tsx` - Add actions
- `app/(app)/transactions/page.tsx` - Wire up modals
- `app/(app)/transactions/components/TransactionsModals.tsx` - Export new modals
- `app/(app)/dashboard/components/DashboardRecentTransactions.tsx` - Add actions

### Files to Remove
- `app/(app)/transactions/[id]/page.tsx` - No longer needed
- `app/(app)/transactions/[id]/components/EditTransactionForm.tsx` - Replaced by modal
- `app/(app)/transactions/[id]/components/EditTransactionDeleteModal.tsx` - Replaced

---

## Implementation Order

1. Create `TransactionDetailModal` (simplest, read-only)
2. Create `TransactionListActions` (component only)
3. Adapt hooks for modal usage (`useTransactionFormState`, `useTransactionFormHandlers`)
4. Create `CreateTransactionModal`
5. Create `EditTransactionModal`
6. Integrate into `TransactionListGroup`
7. Wire up all modals in `page.tsx`
8. Remove `/transactions/[id]` route
9. Fix receipt upload bug
10. Test end-to-end

---

## Success Criteria

- [ ] Create transaction modal opens and submits successfully
- [ ] Edit transaction modal pre-fills data and updates correctly
- [ ] Detail modal shows all transaction fields
- [ ] List item actions work (Detail, Edit, Delete)
- [ ] Receipt image uploads and displays correctly
- [ ] No navigation to `/transactions/[id]` page
- [ ] Form validation works (required fields)
- [ ] Modals close properly on cancel/submit
- [ ] Transaction list refreshes after mutations

---

## Future Enhancements (Optional)

- Floating Action Button (FAB) in bottom-right corner for quick create
- Keyboard shortcuts (Ctrl+N for new transaction)
- Batch delete from transactions list
- Quick edit (inline edit for amount/description only)

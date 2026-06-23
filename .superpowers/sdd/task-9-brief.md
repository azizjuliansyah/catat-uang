### Task 9: Update DashboardRecentTransactions with actions

**Files:**
- Modify: `app/(app)/dashboard/components/DashboardRecentTransactions.tsx`

**Interfaces:**
- Adds: state and handlers for detail/edit modals
- Uses: `TransactionListActions`

**Purpose:** Add action buttons to dashboard transaction list.

- [ ] **Step 1: Read the current file**

```bash
# Read the file first to understand current structure
cat app/(app)/dashboard/components/DashboardRecentTransactions.tsx
```

- [ ] **Step 2: Add imports**

```typescript
// Add to imports:
import { TransactionListActions } from "@/app/(app)/transactions/components/TransactionListActions";
import { TransactionDetailModal } from "@/components/ui/organisms/TransactionDetailModal";
```

- [ ] **Step 3: Add state for modals**

```typescript
// Add to component state:
const [isDetailOpen, setIsDetailOpen] = useState(false);
const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
```

- [ ] **Step 4: Add handlers**

```typescript
// Add handler functions:
const handleDetail = (tx: any) => {
  setSelectedTransaction(tx);
  setIsDetailOpen(true);
};

const handleEdit = (tx: any) => {
  // Navigate to edit modal - dispatch event or use callback
  // For now, navigate to transactions page with edit intent
  window.location.href = `/transactions?edit=${tx.id};
};
```

- [ ] **Step 5: Add TransactionListActions to each transaction item**

Add the component after the amount display in each transaction item.

- [ ] **Step 6: Add detail modal render**

```typescript
// At the end, before closing tag:
{selectedTransaction && (
  <TransactionDetailModal
    isOpen={isDetailOpen}
    onClose={() => {
      setIsDetailOpen(false);
      setSelectedTransaction(null);
    }}
    transaction={selectedTransaction}
    onEdit={handleEdit}
  />
)}
```

- [ ] **Step 7: Commit**

```bash
git add app/(app)/dashboard/components/DashboardRecentTransactions.tsx
git commit -m "feat: add action buttons to dashboard transactions"
```

---


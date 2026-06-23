### Task 6: Update TransactionListGroup to use actions

**Files:**
- Modify: `app/(app)/transactions/components/TransactionListGroup.tsx`

**Interfaces:**
- Adds props: `onDetail`, `onEdit` (onDelete already exists)

**Purpose:** Integrate action buttons into list items and remove navigation to edit page.

- [ ] **Step 1: Update the imports and props**

```typescript
// Add to imports
import { TransactionListActions } from "./TransactionListActions";

// Update interface - add onDetail and onEdit props
interface TransactionListGroupProps {
  uniqueDates: string[];
  groupedTransactions: { [date: string]: Transaction[] };
  formatDateLong: (dateStr: string) => string;
  formatIDR: (val: number) => string;
  setReceiptModalUrl: (url: string | null) => void;
  setTransactionToDelete: (tx: Transaction | null) => void;
  onDetail: (tx: Transaction) => void;
  onEdit: (tx: Transaction) => void;
}
```

- [ ] **Step 2: Update the component signature**

```typescript
export function TransactionListGroup({
  uniqueDates,
  groupedTransactions,
  formatDateLong,
  formatIDR,
  setReceiptModalUrl,
  setTransactionToDelete,
  onDetail,
  onEdit
}: TransactionListGroupProps) {
  // Remove the local state and handlers for detail modal
  // const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  // const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  // const openDetailModal = (tx: Transaction) => { ... };
  // const handleEdit = (tx: Transaction) => { ... };
  // const handleDelete = (tx: Transaction) => { ... };

  // The component now uses props for these actions
```

- [ ] **Step 3: Remove the detail modal render at the bottom**

Remove the entire `<TransactionDetailModal>` component and its related state from the file. The detail modal will be managed by the parent page component.

- [ ] **Step 4: Update the list item click handler and add action buttons**

```typescript
// In the list item mapping, replace the onClick on the whole div:
<div
  key={tx.id}
  className="bg-surface-card border border-border hover:border-border-strong rounded-2xl p-4 flex items-center justify-between transition-all group"
  // Remove: onClick={() => openDetailModal(tx)}
>

  // ... keep existing content ...

  // Replace the amount and eye icon section with:
  <div className="flex items-center gap-3 ml-4 shrink-0">
    <span className={`text-sm font-bold font-mono ${
      tx.type === "income" ? "text-income" : "text-expense"
    }`}>
      {tx.type === "income" ? "+" : "-"} {formatIDR(tx.amount)}
    </span>

    <TransactionListActions
      transaction={tx}
      onDetail={onDetail}
      onEdit={onEdit}
      onDelete={(tx) => setTransactionToDelete(tx)}
    />
  </div>
</div>
```

- [ ] **Step 5: Commit**

```bash
git add app/(app)/transactions/components/TransactionListGroup.tsx
git commit -m "refactor: add action buttons to transaction list items"
```

---


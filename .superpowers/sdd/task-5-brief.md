### Task 5: Create TransactionListActions

**Files:**

- Create: `app/(app)/transactions/components/TransactionListActions.tsx`

**Interfaces:**

- Props: `transaction`, `onDetail`, `onEdit`, `onDelete`

**Purpose:** Action buttons component for each transaction list item.

- [ ] **Step 1: Write the file**

```typescript
// app/(app)/transactions/components/TransactionListActions.tsx
"use client";

import { Button } from "@/components/ui/atoms/Button";
import { Eye, Edit2, Trash2 } from "lucide-react";

interface Transaction {
  id: string;
  [key: string]: any;
}

interface TransactionListActionsProps {
  transaction: Transaction;
  onDetail: (tx: Transaction) => void;
  onEdit: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
}

export function TransactionListActions({
  transaction,
  onDetail,
  onEdit,
  onDelete
}: TransactionListActionsProps) {
  return (
    <div className="flex items-center gap-1.5">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDetail(transaction)}
        className="h-8 px-2"
        title="Lihat Detail"
      >
        <Eye className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onEdit(transaction)}
        className="h-8 px-2"
        title="Edit"
      >
        <Edit2 className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(transaction)}
        className="h-8 px-2 text-danger hover:text-danger hover:bg-danger/10"
        title="Hapus"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/(app)/transactions/components/TransactionListActions.tsx
git commit -m "feat: add TransactionListActions component"
```

---

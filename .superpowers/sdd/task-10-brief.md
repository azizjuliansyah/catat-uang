### Task 10: Remove old edit page and components

**Files:**
- Delete: `app/(app)/transactions/[id]/page.tsx`
- Delete: `app/(app)/transactions/[id]/components/EditTransactionForm.tsx`
- Delete: `app/(app)/transactions/[id]/components/EditTransactionDeleteModal.tsx`
- Delete: `app/(app)/transactions/new/page.tsx` (optional - can keep for direct URL access, but redirect to modal)

**Purpose:** Clean up unused page-based components.

- [ ] **Step 1: Delete the directory**

```bash
rm -rf app/(app)/transactions/[id]
```

- [ ] **Step 2: Update new transaction page to redirect or show modal**

```typescript
// app/(app)/transactions/new/page.tsx - replace with redirect
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewTransactionPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to transactions page - the modal will be triggered via URL param if needed
    router.push("/transactions?create=true");
  }, [router]);

  return null;
}
```

Or delete entirely if no direct links exist.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "refactor: remove old transaction detail/edit pages"
```

---


### Task 7: Update TransactionsModals to export new modals

**Files:**
- Modify: `app/(app)/transactions/components/TransactionsModals.tsx`

**Interfaces:**
- Adds: `CreateTransactionModal`, `EditTransactionModal` exports
- Removes: Transaction detail modal (handled separately)

**Purpose:** Export all transaction modals for use in page component.

- [ ] **Step 1: Update the file**

```typescript
// app/(app)/transactions/components/TransactionsModals.tsx
import { DeleteConfirmationModal } from "@/components/ui/organisms/DeleteConfirmationModal";
import { TransactionDetailModal } from "@/components/ui/organisms/TransactionDetailModal";
import { CreateTransactionModal } from "./CreateTransactionModal";
import { EditTransactionModal } from "./EditTransactionModal";

interface Transaction {
  id: string;
  user_id: string;
  wallet_id: string | null;
  paylater_id: string | null;
  category_id: string | null;
  amount: number;
  type: "income" | "expense";
  description: string | null;
  transaction_date: string;
  receipt_url: string | null;
  created_at: string;
  wallets: {
    name: string;
    icon: string;
    color: string;
  } | null;
  paylater_platforms: {
    name: string;
    color: string;
    icon: string;
  } | null;
  categories: {
    name: string;
    icon: string;
    color: string;
  } | null;
}

interface TransactionsModalsProps {
  // Create modal props
  isCreateOpen: boolean;
  onCloseCreate: () => void;
  onCreateSuccess: () => void;

  // Edit modal props
  isEditOpen: boolean;
  onCloseEdit: () => void;
  onEditSuccess: () => void;
  transactionToEdit: Transaction | null;

  // Detail modal props
  isDetailOpen: boolean;
  onCloseDetail: () => void;
  transactionToView: Transaction | null;

  // Delete modal props
  transactionToDelete: Transaction | null;
  onCloseDelete: () => void;
  onConfirmDelete: () => void;
  isDeleting: boolean;

  // Receipt modal props
  receiptModalUrl: string | null;
  onCloseReceipt: () => void;
  formatIDR: (val: number) => string;
}

export function TransactionsModals({
  isCreateOpen,
  onCloseCreate,
  onCreateSuccess,
  isEditOpen,
  onCloseEdit,
  onEditSuccess,
  transactionToEdit,
  isDetailOpen,
  onCloseDetail,
  transactionToView,
  transactionToDelete,
  onCloseDelete,
  onConfirmDelete,
  isDeleting,
  receiptModalUrl,
  onCloseReceipt,
  formatIDR,
}: TransactionsModalsProps) {
  return (
    <>
      {/* Create Transaction Modal */}
      <CreateTransactionModal
        isOpen={isCreateOpen}
        onClose={onCloseCreate}
        onSuccess={onCreateSuccess}
      />

      {/* Edit Transaction Modal */}
      {transactionToEdit && (
        <EditTransactionModal
          isOpen={isEditOpen}
          onClose={onCloseEdit}
          onSuccess={onEditSuccess}
          transaction={transactionToEdit}
        />
      )}

      {/* Detail Modal */}
      <TransactionDetailModal
        isOpen={isDetailOpen}
        onClose={onCloseDetail}
        transaction={transactionToView}
      />

      {/* Delete Transaction Modal */}
      <DeleteConfirmationModal
        isOpen={transactionToDelete !== null}
        onClose={onCloseDelete}
        onConfirm={onConfirmDelete}
        isDestructive
        title="Hapus Transaksi?"
        message={
          transactionToDelete ?
            `Apakah Anda yakin ingin menghapus transaksi ${
              transactionToDelete.description ||
              transactionToDelete.categories?.name ||
              "Pemasukan/Pengeluaran"
            } sebesar ${formatIDR(transactionToDelete.amount)}? Saldo dompet akan disesuaikan secara otomatis.`
          : ""
        }
        confirmText="Hapus"
        isConfirming={isDeleting}
      />

      {/* Receipt Image Modal */}
      <Modal
        isOpen={receiptModalUrl !== null}
        onClose={onCloseReceipt}
        title="Nota Lampiran Transaksi"
        className="sm:max-w-xl md:max-w-2xl"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-full max-h-[60vh] overflow-auto rounded-xl bg-black/40 flex items-center justify-center border border-border">
            <img
              src={receiptModalUrl || ""}
              alt="Nota Transaksi"
              className="max-w-full max-h-[60vh] object-contain rounded"
            />
          </div>
        </div>
      </Modal>
    </>
  );
}

// Re-export individual modals for convenience
export { CreateTransactionModal } from "./CreateTransactionModal";
export { EditTransactionModal } from "./EditTransactionModal";
```

- [ ] **Step 2: Update imports**

Add `Modal` to imports if not present:
```typescript
import { Modal } from "@/components/ui/organisms/Modal";
```

- [ ] **Step 3: Commit**

```bash
git add app/(app)/transactions/components/TransactionsModals.tsx
git commit -m "refactor: update TransactionsModals to export new modals"
```

---


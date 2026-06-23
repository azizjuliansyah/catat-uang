### Task 8: Wire up modals in transactions page

**Files:**
- Modify: `app/(app)/transactions/page.tsx`

**Interfaces:**
- Adds state for: create, edit, detail modals
- Updates: `TransactionListGroup` props, `TransactionsModals` props

**Purpose:** Connect all modals to page state and update button to open create modal.

- [ ] **Step 1: Add modal state to component**

```typescript
// In the component, after existing state:
const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
const [isEditModalOpen, setIsEditModalOpen] = useState(false);
const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
const [transactionToView, setTransactionToView] = useState<Transaction | null>(null);
```

- [ ] **Step 2: Add handler functions**

```typescript
// After state declarations:
const handleDetail = (tx: Transaction) => {
  setTransactionToView(tx);
  setIsDetailModalOpen(true);
};

const handleEdit = (tx: Transaction) => {
  setTransactionToEdit(tx);
  setIsEditModalOpen(true);
};

const handleCloseDetail = () => {
  setIsDetailModalOpen(false);
  setTransactionToView(null);
};

const handleCloseEdit = () => {
  setIsEditModalOpen(false);
  setTransactionToEdit(null);
};

const handleCloseCreate = () => {
  setIsCreateModalOpen(false);
};
```

- [ ] **Step 3: Update the "Transaksi Baru" button**

```typescript
// Find the "Transaksi Baru" button and update onClick:
<Button
  variant="primary"
  size="sm"
  onClick={() => setIsCreateModalOpen(true)}
>
  <Plus className="w-4 h-4 mr-1.5" />
  Transaksi Baru
</Button>
```

- [ ] **Step 4: Update TransactionListGroup props**

```typescript
// Find the TransactionListGroup component and add new props:
<TransactionListGroup
  uniqueDates={uniqueDates}
  groupedTransactions={groupedTransactions}
  formatDateLong={formatDateLong}
  formatIDR={formatIDR}
  setReceiptModalUrl={setReceiptModalUrl}
  setTransactionToDelete={setTransactionToDelete}
  onDetail={handleDetail}
  onEdit={handleEdit}
/>
```

- [ ] **Step 5: Update TransactionsModals props**

```typescript
// Find the TransactionsModals component and update props:
<TransactionsModals
  transactionToDelete={transactionToDelete}
  onCloseDelete={() => setTransactionToDelete(null)}
  onConfirmDelete={() => {
    if (transactionToDelete) {
      handleDeleteTransaction(transactionToDelete, () => setTransactionToDelete(null));
    }
  }}
  isDeleting={deletingId !== null}
  receiptModalUrl={receiptModalUrl}
  onCloseReceipt={() => setReceiptModalUrl(null)}
  formatIDR={formatIDR}
  isCreateOpen={isCreateModalOpen}
  onCloseCreate={handleCloseCreate}
  onCreateSuccess={fetchTransactions}
  isEditOpen={isEditModalOpen}
  onCloseEdit={handleCloseEdit}
  onEditSuccess={fetchTransactions}
  transactionToEdit={transactionToEdit}
  isDetailOpen={isDetailModalOpen}
  onCloseDetail={handleCloseDetail}
  transactionToView={transactionToView}
/>
```

- [ ] **Step 6: Commit**

```bash
git add app/(app)/transactions/page.tsx
git commit -m "feat: wire up transaction modals in page"
```

---


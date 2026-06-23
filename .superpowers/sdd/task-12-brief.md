### Task 12: Test and verify

**Purpose:** End-to-end testing of all modal functionality.

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

Expected: Server starts on http://localhost:3000

- [ ] **Step 2: Test create transaction flow**

1. Navigate to `/transactions`
2. Click "Transaksi Baru" button
3. Verify modal opens with all fields
4. Fill in required fields (amount, date, source, category)
5. (Optional) Upload a receipt image
6. Submit form
7. Verify transaction appears in list
8. Verify receipt is saved (if uploaded)

Expected: Transaction created successfully, receipt URL saved if uploaded.

- [ ] **Step 3: Test view detail flow**

1. Click "Detail" button (eye icon) on any transaction
2. Verify modal opens with all transaction details
3. Verify receipt thumbnail shown (if exists)
4. Click close button

Expected: Detail modal shows correct information.

- [ ] **Step 4: Test edit transaction flow**

1. Click "Edit" button on any transaction
2. Verify modal opens with pre-filled data
3. Modify a field (e.g., amount or description)
4. Submit form
5. Verify transaction updated in list
6. Open detail to verify changes

Expected: Transaction updated correctly.

- [ ] **Step 5: Test delete transaction flow**

1. Click "Delete" button on any transaction
2. Verify confirmation modal appears
3. Click cancel
4. Click delete again
5. Confirm deletion
6. Verify transaction removed from list

Expected: Delete confirmation works, transaction deleted.

- [ ] **Step 6: Test form validation**

1. Open create modal
2. Try to submit without filling required fields
3. Verify validation errors appear
4. Fill with invalid amount (negative or zero)
5. Verify error message

Expected: Form validates correctly.

- [ ] **Step 7: Test keyboard navigation**

1. Press Escape to close modals
2. Verify focus returns to trigger button

Expected: Keyboard navigation works.

- [ ] **Step 8: Test dashboard integration**

1. Navigate to `/dashboard`
2. Find recent transactions
3. Test action buttons (detail, edit)

Expected: Actions work from dashboard too.

---


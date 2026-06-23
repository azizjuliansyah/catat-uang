### Task 11: Fix receipt upload bug

**Files:**
- Investigate: `app/(app)/transactions/hooks/useTransactionFormHandlers.ts`

**Purpose:** Ensure receipt images are properly uploaded and saved to database.

**Investigation Steps:**

- [ ] **Step 1: Check Supabase storage bucket exists**

```sql
-- Run in Supabase SQL Editor to verify bucket:
SELECT * FROM storage.buckets WHERE name = 'receipts';
```

Expected: Should return one row with bucket info.

If not exists:
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true);
```

- [ ] **Step 2: Check RLS policies on receipts bucket**

```sql
SELECT * FROM storage.policies WHERE bucket = 'receipts';
```

Expected: Should have INSERT and SELECT policies for authenticated users.

If missing:
```sql
-- Allow authenticated users to upload
INSERT INTO storage.policies (bucket, name, definition)
VALUES (
  'receipts',
  'authenticated_can_upload',
  'auth.role() = ''authenticated'''
);

-- Allow public access to read (since bucket is public)
-- Or authenticated users only:
INSERT INTO storage.policies (bucket, name, definition)
VALUES (
  'receipts',
  'authenticated_can_select',
  'auth.role() = ''authenticated'''
);
```

- [ ] **Step 3: Verify the upload logic**

In `useTransactionFormHandlers.ts`, the upload logic at lines 91-108 should:
1. Upload file with unique path: `${user.id}/receipt-${Date.now()}.${fileExt}`
2. Get public URL correctly
3. Set `finalReceiptUrl` to the public URL
4. Include `receipt_url: finalReceiptUrl` in the insert/update

- [ ] **Step 4: Test with console logging**

Add temporary logging to verify:
```typescript
console.log("Uploading receipt to:", filePath);
console.log("Upload error:", uploadError);
console.log("Public URL:", publicUrl);
console.log("Final receipt URL:", finalReceiptUrl);
```

- [ ] **Step 5: Verify database column**

```sql
-- Check column exists and is correct type
\d transactions.receipt_url
-- Or for Supabase:
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'transactions' AND column_name = 'receipt_url';
```

Expected: `receipt_url | text | YES`

- [ ] **Step 6: Commit any fixes**

```bash
git add app/(app)/transactions/hooks/useTransactionFormHandlers.ts
git commit -m "fix: ensure receipt upload saves URL correctly"
```

---


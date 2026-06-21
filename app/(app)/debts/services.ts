import { SupabaseClient } from "@supabase/supabase-js";
import { DebtPackage, DebtItem } from "./types";

/**
 * Fetches the list of all debts including nested transactions and proofs.
 */
export async function fetchDebtsList(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("debts")
    .select(`
      *,
      debt_transactions (
        *,
        debt_transaction_proofs (*)
      )
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Creates or updates a debt record and processes all related packages/transactions/proofs.
 */
export async function saveDebt(
  supabase: SupabaseClient,
  userId: string,
  editingDebtId: string | null,
  formName: string,
  formType: "owe" | "lend",
  formPackages: DebtPackage[],
  existingTxnIds: string[] = []
) {
  let parentDebtId = editingDebtId;

  // 1. Create or Update parent debt row
  const firstTxnDate = formPackages[0]?.createdAt 
    ? new Date(formPackages[0].createdAt).toISOString() 
    : new Date().toISOString();

  if (editingDebtId) {
    const { error: updateDebtError } = await supabase
      .from("debts")
      .update({
        name: formName.trim(),
        type: formType,
        created_at: firstTxnDate,
        updated_at: new Date().toISOString()
      })
      .eq("id", editingDebtId);
    if (updateDebtError) throw updateDebtError;
  } else {
    const { data: newDebt, error: newDebtError } = await supabase
      .from("debts")
      .insert({
        user_id: userId,
        name: formName.trim(),
        type: formType,
        total_amount: 0, // Will be calculated by trigger automatically
        paid_amount: 0,
        status: "unpaid",
        created_at: firstTxnDate
      })
      .select()
      .single();
    if (newDebtError) throw newDebtError;
    parentDebtId = newDebt.id;
  }

  if (!parentDebtId) {
    throw new Error("Failed to resolve parent debt ID");
  }

  // 2. If editing, determine transaction deletions
  if (editingDebtId) {
    const { data: dbTxns, error: fetchTxnsError } = await supabase
      .from("debt_transactions")
      .select("id")
      .eq("debt_id", editingDebtId);
    if (fetchTxnsError) throw fetchTxnsError;
    
    const dbTxnIds = dbTxns?.map((t: { id: string }) => t.id) || [];
    const formTxnIds = formPackages.map(pkg => pkg.id);
    
    const txnIdsToDelete = dbTxnIds.filter((id: string) => !formTxnIds.includes(id));
    if (txnIdsToDelete.length > 0) {
      const { error: deleteTxnsError } = await supabase
        .from("debt_transactions")
        .delete()
        .in("id", txnIdsToDelete);
      if (deleteTxnsError) throw deleteTxnsError;
    }
  }

  // 3. Process each transaction in formPackages
  for (const pkg of formPackages) {
    const amountNum = parseFloat(pkg.totalAmount);
    const isoDueDate = pkg.dueDate ? new Date(pkg.dueDate).toISOString() : null;
    const isoCreatedAt = pkg.createdAt ? new Date(pkg.createdAt).toISOString() : new Date().toISOString();
    
    let transactionId = pkg.id;
    const isNewTxn = !editingDebtId || !existingTxnIds.includes(pkg.id);

    if (isNewTxn) {
      const { data: newTxn, error: insertTxnError } = await supabase
        .from("debt_transactions")
        .insert({
          debt_id: parentDebtId,
          amount: amountNum,
          due_date: isoDueDate,
          created_at: isoCreatedAt,
          description: pkg.description.trim() || null
        })
        .select()
        .single();
      if (insertTxnError) throw insertTxnError;
      transactionId = newTxn.id;
    } else {
      const { error: updateTxnError } = await supabase
        .from("debt_transactions")
        .update({
          amount: amountNum,
          due_date: isoDueDate,
          created_at: isoCreatedAt,
          description: pkg.description.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", transactionId);
      if (updateTxnError) throw updateTxnError;
    }

    // Handle transaction proof deletions
    if (pkg.shouldDeleteProofUrls && pkg.shouldDeleteProofUrls.length > 0) {
      const { error: deleteProofError } = await supabase
        .from("debt_transaction_proofs")
        .delete()
        .eq("transaction_id", transactionId)
        .in("proof_url", pkg.shouldDeleteProofUrls);
      if (deleteProofError) throw deleteProofError;
    }

    // Handle transaction proof file uploads
    if (pkg.proofFiles && pkg.proofFiles.length > 0) {
      const proofUrlsToInsert: string[] = [];
      for (const file of pkg.proofFiles) {
        const fileExt = file.name.split(".").pop();
        const filePath = `${userId}/debt-proof-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("receipts")
          .upload(filePath, file, { upsert: true });
          
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from("receipts")
          .getPublicUrl(filePath);
          
        proofUrlsToInsert.push(publicUrl);
      }

      if (proofUrlsToInsert.length > 0) {
        const { error: insertProofError } = await supabase
          .from("debt_transaction_proofs")
          .insert(proofUrlsToInsert.map(url => ({
            transaction_id: transactionId,
            proof_url: url
          })));
        if (insertProofError) throw insertProofError;
      }
    }
  }
}

/**
 * Deletes a debt record.
 */
export async function deleteDebt(supabase: SupabaseClient, debtId: string) {
  const { error } = await supabase
    .from("debts")
    .delete()
    .eq("id", debtId);

  if (error) throw error;
}

/**
 * Records a payment against a debt, creating a transaction record and uploading proofs.
 */
export async function recordPayment(
  supabase: SupabaseClient,
  userId: string,
  debt: DebtItem,
  amountNum: number,
  payWalletId: string,
  payDate: string,
  payProofFiles: File[] | null
) {
  const txType = debt.type === "lend" ? "income" : "expense";
  const txDescription = debt.type === "lend"
    ? `Terima pelunasan: ${debt.name}`
    : `Bayar hutang: ${debt.name}`;

  const { data: newTx, error: txError } = await supabase
    .from("transactions")
    .insert([{
      user_id: userId,
      wallet_id: payWalletId,
      paylater_id: null,
      category_id: null,
      amount: amountNum,
      type: txType,
      description: txDescription,
      transaction_date: new Date(payDate).toISOString(),
      receipt_url: null
    }])
    .select()
    .single();

  if (txError) throw txError;

  const { data: newPayment, error: paymentError } = await supabase
    .from("debt_payments")
    .insert([{
      debt_id: debt.id,
      wallet_id: payWalletId,
      amount: amountNum,
      payment_date: new Date(payDate).toISOString(),
      transaction_id: newTx.id
    }])
    .select()
    .single();

  if (paymentError) {
    // Rollback transaction on payment record failure
    await supabase.from("transactions").delete().eq("id", newTx.id);
    throw paymentError;
  }

  // Handle multiple payment proofs
  if (payProofFiles && payProofFiles.length > 0) {
    const paymentProofUrls: string[] = [];
    for (const file of payProofFiles) {
      const fileExt = file.name.split(".").pop();
      const filePath = `${userId}/payment-proof-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("receipts")
        .upload(filePath, file, { upsert: true });
        
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from("receipts")
        .getPublicUrl(filePath);
        
      paymentProofUrls.push(publicUrl);
    }

    if (paymentProofUrls.length > 0) {
      const { error: insertProofError } = await supabase
        .from("debt_payment_proofs")
        .insert(paymentProofUrls.map(url => ({
          payment_id: newPayment.id,
          proof_url: url
        })));
      if (insertProofError) throw insertProofError;
    }
  }
}

/**
 * Deletes a payment record and the associated transaction.
 */
export async function deletePayment(
  supabase: SupabaseClient,
  paymentId: string,
  transactionId: string | null | undefined
) {
  const { error: deletePaymentError } = await supabase
    .from("debt_payments")
    .delete()
    .eq("id", paymentId);

  if (deletePaymentError) throw deletePaymentError;

  if (transactionId) {
    const { error: deleteTxError } = await supabase
      .from("transactions")
      .delete()
      .eq("id", transactionId);
    if (deleteTxError) throw deleteTxError;
  }
}

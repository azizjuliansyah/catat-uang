"use client";

import { useEditTransactionState } from "./hooks/useEditTransactionState";
import { useEditTransactionHandlers } from "./hooks/useEditTransactionHandlers";
import { EditTransactionForm } from "./components/EditTransactionForm";
import { EditTransactionDeleteModal } from "./components/EditTransactionDeleteModal";

export default function EditTransactionPage() {
  const state = useEditTransactionState();
  const handlers = useEditTransactionHandlers(state);

  if (state.loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
        <div className="h-6 w-32 bg-border/40 rounded" />
        <div className="h-96 bg-surface-card border border-border rounded-xl" />
      </div>
    );
  }

  return (
    <>
      <EditTransactionForm state={state} handlers={handlers} />
      <EditTransactionDeleteModal state={state} handlers={handlers} />
    </>
  );
}

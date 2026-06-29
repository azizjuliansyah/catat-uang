"use client";

import { Eye, Edit2, Trash2, MoreVertical } from "lucide-react";
import { Transaction } from "../types";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/molecules";

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
  const menuItems: DropdownMenuItem[] = [
    {
      label: "Detail",
      icon: Eye,
      onClick: () => onDetail(transaction),
    },
    {
      label: "Edit",
      icon: Edit2,
      onClick: () => onEdit(transaction),
      dividerAfter: true,
    },
    {
      label: "Hapus",
      icon: Trash2,
      variant: "danger",
      onClick: () => onDelete(transaction),
    },
  ];

  return (
    <DropdownMenu
      triggerIcon={MoreVertical}
      items={menuItems}
      align="right"
    />
  );
}


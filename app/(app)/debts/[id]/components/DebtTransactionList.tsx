/**
 * Debt Transaction List Component
 * Displays debt transactions with proofs in accordion format
 */

import { DebtTransactionItem } from "../types";
import { formatIDR, isOverdue } from "../../utils";
import { formatDateTimeShort } from "@/lib/utils/date";
import { FileText, ExternalLink, Clock } from "lucide-react";
import { Accordion } from "@/components/ui/molecules/Accordion";
import Image from "next/image";

interface DebtTransactionListProps {
  transactions: DebtTransactionItem[];
  debtStatus: "unpaid" | "paid";
  defaultOpenIndex?: number; // Index of item to be open by default (-1 for all closed)
}

export function DebtTransactionList({ transactions, debtStatus, defaultOpenIndex = -1 }: DebtTransactionListProps) {
  const accordionItems = transactions.map((txn, idx) => ({
    id: txn.id,
    trigger: (
      <div className="flex items-center justify-between gap-3 w-full">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-bold text-text-secondary uppercase tracking-wider self-center">
            #{idx + 1}
          </span>
          <span className="text-sm font-bold text-text-primary font-mono">
            {formatIDR(txn.amount)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Debt Date */}
          <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-surface-input text-text-secondary border border-border">
            {formatDateTimeShort(txn.created_at)}
          </span>
          {/* Due Date Badge */}
          <span
            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
              txn.due_date && isOverdue(txn.due_date) && debtStatus === "unpaid"
                ? "bg-danger/10 text-danger border-danger/20"
                : "bg-surface-input text-text-secondary border-border"
            }`}
          >
            Tempo: {txn.due_date ? formatDateTimeShort(txn.due_date) : "-"}
          </span>
        </div>
      </div>
    ),
    children: (
      <div className="space-y-3 pt-2">
        {/* Description */}
        {txn.description && (
          <div className="space-y-1">
            <span className="text-xs text-text-secondary">
              Keterangan:
            </span>
            <p className="text-xs text-text-primary whitespace-pre-wrap font-serif italic bg-surface/50 p-2.5 rounded-lg border border-border/40">
              "{txn.description}"
            </p>
          </div>
        )}

        {/* Proofs */}
        {txn.debt_transaction_proofs && txn.debt_transaction_proofs.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs text-text-secondary">
              Bukti Lampiran ({txn.debt_transaction_proofs.length}):
            </span>
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {txn.debt_transaction_proofs.map((proof) => (
                <a
                  key={proof.id}
                  href={proof.proof_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-border rounded-lg overflow-hidden w-full aspect-square bg-surface-input relative group hover:border-border-strong transition-colors mx-auto"
                >
                  <Image
                    src={proof.proof_url}
                    alt="Bukti transaksi"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 20vw"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ExternalLink className="w-4 h-4 text-white" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    ),
  }));

  return (
    <div className="bg-surface-card border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-extrabold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-text-secondary" />
          Daftar Transaksi Hutang/Piutang
        </h3>
        <span className="text-[10px] text-text-muted">{transactions.length} item</span>
      </div>

      {transactions.length > 0 ? (
        <Accordion items={accordionItems} defaultOpenIndex={defaultOpenIndex} />
      ) : (
        <div className="text-center py-8 text-xs text-text-secondary border border-dashed border-border rounded-xl">
          Tidak ada transaksi ditemukan.
        </div>
      )}
    </div>
  );
}

/**
 * Debt Transaction List Component
 * Displays debt transactions with proofs
 */

import { DebtTransactionItem } from "../types";
import { formatIDR, isOverdue } from "../../utils";
import { formatDateTimeShort } from "@/lib/utils/date";
import { FileText, ExternalLink } from "lucide-react";

interface DebtTransactionListProps {
  transactions: DebtTransactionItem[];
  debtStatus: "unpaid" | "paid";
}

export function DebtTransactionList({ transactions, debtStatus }: DebtTransactionListProps) {
  return (
    <div className="bg-surface-card border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-extrabold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-text-secondary" />
          Daftar Transaksi Hutang/Piutang
        </h3>
        <span className="text-[10px] text-text-muted">{transactions.length} item</span>
      </div>

      <div className="space-y-4">
        {transactions.length > 0 ? (
          transactions.map((txn, idx) => (
            <div key={txn.id} className="border border-border rounded-xl p-4 space-y-3 bg-surface/30">
              {/* Transaction Header */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                  Transaksi #{idx + 1}
                </span>
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                  txn.due_date && isOverdue(txn.due_date) && debtStatus === "unpaid"
                    ? "bg-danger/10 text-danger border border-danger/20"
                    : "bg-surface-input text-text-secondary border border-border"
                }`}>
                  {txn.due_date ? formatDateTimeShort(txn.due_date) : "Tidak ada tanggal jatuh tempo"}
                </span>
              </div>

              {/* Amount */}
              <div className="flex items-baseline gap-1">
                <span className="text-xxs text-text-secondary">Jumlah:</span>
                <span className="text-sm font-bold text-text-primary font-mono">{formatIDR(txn.amount)}</span>
              </div>

              {/* Description */}
              {txn.description && (
                <div className="space-y-1">
                  <span className="text-xxs text-text-secondary">Keterangan:</span>
                  <p className="text-xs text-text-primary whitespace-pre-wrap font-serif italic bg-surface/50 p-2 rounded-lg border border-border/40">
                    "{txn.description}"
                  </p>
                </div>
              )}

              {/* Proofs for this transaction */}
              {txn.debt_transaction_proofs && txn.debt_transaction_proofs.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xxs text-text-secondary">Bukti Lampiran ({txn.debt_transaction_proofs.length}):</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {txn.debt_transaction_proofs.map((proof) => (
                      <a
                        key={proof.id}
                        href={proof.proof_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="border border-border rounded-lg overflow-hidden aspect-square bg-surface-input relative group hover:border-border-strong transition-colors"
                      >
                        <img
                          src={proof.proof_url}
                          alt="Bukti transaksi"
                          className="w-full h-full object-cover"
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
          ))
        ) : (
          <div className="text-center py-8 text-xs text-text-secondary border border-dashed border-border rounded-xl">
            Tidak ada transaksi ditemukan.
          </div>
        )}
      </div>
    </div>
  );
}

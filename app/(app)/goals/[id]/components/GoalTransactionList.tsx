/**
 * Goal Transaction List Component
 * Displays transaction history with actions
 */

import { GoalTransaction } from "../../types";
import { formatIDR } from "@/lib/utils/format";
import { formatDateTimeShort } from "@/lib/utils/date";
import { History, Plus, ArrowUpRight, Trash2 } from "lucide-react";
import { ActionButton } from "@/components/ui/atoms/ActionButton";
import { Button } from "@/components/ui/atoms/Button";

interface GoalTransactionListProps {
  transactions: GoalTransaction[];
  hasFunds: boolean;
  isAchieved: boolean;
  isWithdrawn: boolean;
  onTopup: () => void;
  onWithdraw: () => void;
  onDeleteTransaction: (tx: GoalTransaction) => void;
}

export function GoalTransactionList({
  transactions,
  hasFunds,
  isAchieved,
  isWithdrawn,
  onTopup,
  onWithdraw,
  onDeleteTransaction
}: GoalTransactionListProps) {
  return (
    <div className="bg-surface-card border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-xs font-extrabold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
            <History className="w-4 h-4 text-text-secondary" />
            Riwayat Transaksi
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">Catatan top-up & penarikan</p>
        </div>

        <div className="flex items-center gap-2">
          {hasFunds && !isWithdrawn && (
            <Button
              onClick={onWithdraw}
              size="sm"
              variant="ghost"
              className="text-xs py-1.5 px-3 flex items-center gap-1 cursor-pointer font-bold border border-border"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              Tarik Dana
            </Button>
          )}
          {!isAchieved && !isWithdrawn && (
            <Button
              onClick={onTopup}
              size="sm"
              className="text-xs py-1.5 px-3 flex items-center gap-1 cursor-pointer font-bold bg-primary text-white"
            >
              <Plus className="w-3.5 h-3.5" />
              Top-up
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-xs text-text-secondary border border-dashed border-border rounded-xl">
            Belum ada transaksi dicatat.
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {transactions.map((tx, idx) => (
              <div
                key={tx.id}
                className={`flex items-center justify-between py-3.5 ${
                  idx === 0 ? "pt-0" : ""
                } ${idx === transactions.length - 1 ? "pb-0" : ""}`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-xs font-bold font-mono ${
                        tx.type === "topup" ? "text-success" : "text-expense"
                      }`}
                    >
                      {tx.type === "topup" ? "+" : "-"}
                      {formatIDR(tx.amount)}
                    </p>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-surface-hover text-text-secondary border border-border">
                      {tx.type === "topup" ? "Top-up" : "Penarikan"}
                    </span>
                  </div>
                  <p className="text-[10px] text-text-secondary">
                    {tx.wallet_name || "Dompet Terhapus"} • {formatDateTimeShort(tx.date)}
                  </p>
                </div>

                <ActionButton
                  icon={Trash2}
                  title="Hapus Transaksi"
                  variant="danger"
                  onClick={() => onDeleteTransaction(tx)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

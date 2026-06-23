import { Modal } from "@/components/ui/organisms/Modal";
import { Button } from "@/components/ui/atoms/Button";
import { ActionButton } from "@/components/ui/atoms/ActionButton";
import { SavingGoal, GoalTransaction } from "../../types";
import { formatIDR } from "../../utils";
import { Trash2 } from "lucide-react";
import { formatDateTimeShort } from "@/lib/utils/date";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  historyGoal: SavingGoal | null;
  transactionsHistory: GoalTransaction[];
  loadingHistory: boolean;
  onDeleteTx: (tx: GoalTransaction) => void;
}

export function HistoryModal({
  isOpen,
  onClose,
  historyGoal,
  transactionsHistory,
  loadingHistory,
  onDeleteTx
}: HistoryModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Riwayat Tabungan: ${historyGoal?.name}`}
      footer={
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="flex-1"
        >
          Tutup
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2 pr-1">
          {loadingHistory ? (
            <div className="text-center py-8 text-xs text-text-secondary">Memuat riwayat...</div>
          ) : transactionsHistory.length === 0 ? (
            <div className="text-center py-8 text-xs text-text-secondary">Belum ada riwayat transaksi tabungan.</div>
          ) : (
            transactionsHistory.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 bg-surface-hover/30 border border-border rounded-xl">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                      tx.type === "topup" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                    }`}>
                      {tx.type === "topup" ? "Top-up" : "Tarik"}
                    </span>
                    <p className="text-xs font-bold text-text-primary font-mono">{formatIDR(tx.amount)}</p>
                  </div>
                  <p className="text-[10px] text-text-secondary mt-0.5">
                    {tx.wallet_name} • {formatDateTimeShort(tx.date)}
                  </p>
                </div>
                <ActionButton
                  icon={Trash2}
                  title="Hapus Transaksi"
                  variant="danger"
                  onClick={() => onDeleteTx(tx)}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}

/**
 * Debt Payment List Component
 * Displays payment history with actions
 */

import { DebtPaymentItem } from "../types";
import { formatIDR } from "../../utils";
import { formatDateTimeShort } from "@/lib/utils/date";
import { History, Plus, FileImage, Trash2 } from "lucide-react";
import { ActionButton } from "@/components/ui/atoms/ActionButton";
import { Button } from "@/components/ui/atoms/Button";

interface DebtPaymentListProps {
  payments: DebtPaymentItem[];
  debtStatus: "unpaid" | "paid";
  debtType: "owe" | "lend";
  onRecordPayment: () => void;
  onDeletePayment: (payment: DebtPaymentItem) => void;
}

export function DebtPaymentList({
  payments,
  debtStatus,
  debtType,
  onRecordPayment,
  onDeletePayment
}: DebtPaymentListProps) {
  const isOwe = debtType === "owe";

  return (
    <div className="bg-surface-card border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-xs font-extrabold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
            <History className="w-4 h-4 text-text-secondary" />
            Riwayat Pembayaran
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">{isOwe ? "Catatan cicilan yang telah dilakukan" : "Catatan pelunasan yang telah diterima"}</p>
        </div>

        {debtStatus === "unpaid" && (
          <Button
            onClick={onRecordPayment}
            size="sm"
            className="text-xs py-1.5 px-3 flex items-center gap-1 cursor-pointer font-bold bg-primary text-white"
          >
            <Plus className="w-3.5 h-3.5" />
            {isOwe ? "Bayar Cicilan" : "Catat Pelunasan"}
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {payments.length === 0 ? (
          <div className="text-center py-8 text-xs text-text-secondary border border-dashed border-border rounded-xl">
            Belum ada pembayaran dicatat.
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {payments.map((pm, idx) => (
              <div key={pm.id} className={`flex items-center justify-between py-3.5 ${idx === 0 ? "pt-0" : ""} ${idx === payments.length - 1 ? "pb-0" : ""}`}>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-text-primary font-mono">{formatIDR(pm.amount)}</p>
                  <p className="text-[10px] text-text-secondary">
                    {isOwe ? "Menggunakan" : "Diterima ke"} {pm.wallets?.name || "Dompet Terhapus"} • {formatDateTimeShort(pm.payment_date)}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  {pm.debt_payment_proofs && pm.debt_payment_proofs.length > 0 && (
                    <ActionButton
                      href={pm.debt_payment_proofs[0].proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Lihat Bukti Pembayaran"
                      icon={FileImage}
                      variant="primary"
                    />
                  )}
                  <ActionButton
                    icon={Trash2}
                    title="Hapus Pembayaran"
                    variant="danger"
                    onClick={() => onDeletePayment(pm)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

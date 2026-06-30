/**
 * PayLater Payment List Component
 * Lists paylater payment history records
 */

import React, { useState } from "react";
import { PaylaterPlatform, PaylaterPayment } from "../../types";
import { History, Trash2 } from "lucide-react";
import { ActionButton } from "@/components/ui/atoms/ActionButton";
import { formatIDR } from "@/lib/utils/format";
import { formatDateTimeShort } from "@/lib/utils/date";
import { Pagination } from "@/components/ui/molecules";

interface PaylaterPaymentListProps {
  platform: PaylaterPlatform;
  payments: PaylaterPayment[];
  setIsPaymentModalOpen: (value: boolean) => void;
  setPaymentToDelete: (value: PaylaterPayment | null) => void;
}

export function PaylaterPaymentList({
  platform,
  payments,
  setIsPaymentModalOpen,
  setPaymentToDelete
}: PaylaterPaymentListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Paginated payments
  const paginatedPayments = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return payments.slice(startIndex, startIndex + pageSize);
  }, [payments, currentPage, pageSize]);

  return (
    <div className="bg-surface-card border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-xs font-extrabold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
            <History className="w-4 h-4" />
            Riwayat Pembayaran
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">Catatan pelunasan tagihan</p>
        </div>
      </div>

      <div className="space-y-4">
        {payments.length === 0 ? (
          <div className="text-center py-8 text-xs text-text-secondary border border-dashed border-border rounded-xl">
            Belum ada pembayaran dicatat.
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {paginatedPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between py-3">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-text-primary font-mono">{formatIDR(payment.amount)}</p>
                  <p className="text-[10px] text-text-secondary">
                    Menggunakan {payment.wallets?.name || "Dompet Terhapus"} • {formatDateTimeShort(payment.payment_date)}
                  </p>
                </div>

                <ActionButton
                  icon={Trash2}
                  size="sm"
                  title="Hapus Pembayaran"
                  variant="danger"
                  onClick={() => setPaymentToDelete(payment)}
                />
              </div>
            ))}
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalItems={payments.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>
    </div>
  );
}

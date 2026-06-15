import { useState } from "react";
import { DebtItem } from "../types";
import { isOverdue } from "../utils";
import { formatIDR } from "@/lib/utils/format";
import { Edit2, Trash2, User, Calendar, History, Coins, ExternalLink } from "lucide-react";
import { formatDateTimeShort } from "@/lib/utils/date";
import { Button } from "@/components/ui/atoms/Button";
import { ActionButton } from "@/components/ui/atoms/ActionButton";
import { DynamicColorIcon } from "@/components/ui/atoms/DynamicColorIcon";
import { FinancialCard } from "@/components/ui/organisms/FinancialCard";

import Link from "next/link";

interface DebtCardProps {
  item: DebtItem;
  onEdit: (item: DebtItem) => void;
  onDelete: (item: DebtItem) => void;
  onPay: (item: DebtItem) => void;
}

export function DebtCard({ item, onEdit, onDelete, onPay }: DebtCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const remaining = item.total_amount - item.paid_amount;
  const progress = item.total_amount > 0 ? (item.paid_amount / item.total_amount) * 100 : 0;
  const firstTxnDueDate = item.debt_transactions?.[0]?.due_date;
  const isLate = item.status === "unpaid" && firstTxnDueDate && isOverdue(firstTxnDueDate);
  const isOwe = item.type === "owe";

  const cardColor = isOwe ? "#f59e0b" : "#06b6d4";

  return (
    <FinancialCard
      cardColor={cardColor}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="border border-solid"
    >
      {/* Top Info */}
      <div className="w-full">
        <div className="flex items-start justify-between relative z-10 w-full">
          <div className="flex items-center gap-3 min-w-0">
            <DynamicColorIcon icon={User} color={cardColor} size="sm" variant="light" />
            <div className="min-w-0">
              <h3
                className="font-bold text-sm sm:text-base leading-tight transition-colors duration-300 truncate"
                style={{
                  color: isHovered ? cardColor : "var(--color-text-primary)"
                }}
              >
                {item.name}
              </h3>
              <span className="text-[10px] text-text-secondary block mt-0.5">
                <span className="font-semibold uppercase tracking-wider">{isOwe ? "Hutang Ke" : "Piutang Dari"}</span>
                {item.created_at && (
                  <span className="text-text-muted font-normal">
                     • {formatDateTimeShort(item.created_at)}
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-0.5 shrink-0 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <ActionButton
              size="sm"
              icon={Edit2}
              title="Ubah Catatan"
              onClick={() => onEdit(item)}
            />
            <ActionButton
              size="sm"
              icon={Trash2}
              title="Hapus Catatan"
              variant="danger"
              onClick={() => onDelete(item)}
            />
          </div>
        </div>

        {/* Amounts */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs relative z-10 w-full">
          <div>
            <p className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">Total Tagihan</p>
            <p className="font-bold text-text-primary font-mono mt-0.5">{formatIDR(item.total_amount)}</p>
          </div>
          <div className="text-right">
            <p className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">Sisa Tagihan</p>
            <p className={`font-bold font-mono mt-0.5 ${item.status === "paid" ? "text-success" : "text-text-primary"}`}>
              {item.status === "paid" ? "Lunas" : formatIDR(remaining)}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 relative z-10 w-full">
          <div className="w-full h-1.5 bg-surface-input rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                backgroundColor: item.status === "paid" ? "var(--color-success)" : cardColor
              }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-text-secondary mt-1 font-mono">
            <span>Terbayar: {formatIDR(item.paid_amount)}</span>
            <span>{progress.toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between gap-2 relative z-10 w-full">
        <div className="flex items-center gap-1 text-[10px] text-text-secondary">
          <Calendar className="w-3.5 h-3.5 text-text-secondary" />
          <span>Tempo: </span>
          <span className={`font-bold ${isLate ? "text-danger" : "text-text-primary"}`}>
            {firstTxnDueDate ? formatDateTimeShort(firstTxnDueDate) : "-"}
          </span>
          {isLate && (
            <span className="ml-1 px-1.5 py-0.5 bg-danger/10 text-danger border border-danger/20 rounded font-bold text-[8px] uppercase tracking-wider animate-pulse">
              Terlewat
            </span>
          )}
        </div>

          <Link
            href={`/debts/${item.id}`}
            className="text-[10px] font-semibold text-primary hover:underline uppercase flex items-center gap-1"
          >
            <ExternalLink className="w-3 h-3" />
            Lihat Detail
          </Link>
      </div>

      <div className="flex justify-end mt-1.5">
          {item.status === "unpaid" && (
            <Button
              size="sm"
              color={cardColor}
              onClick={() => onPay(item)}
            >
              <Coins className="w-3.5 h-3.5" />
              Bayar
            </Button>
          )}
      </div>
    </FinancialCard>
  );
}

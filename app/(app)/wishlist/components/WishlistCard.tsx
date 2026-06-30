import { useState } from "react";
import { WishlistItem } from "../types";
import { formatIDR } from "@/lib/utils/format";
import { Edit2, Trash2, Calendar, Check, Gift } from "lucide-react";
import { CardActions } from "@/components/ui/molecules/CardActions";
import { DynamicColorIcon } from "@/components/ui/atoms/DynamicColorIcon";
import { FinancialCard } from "@/components/ui/organisms/FinancialCard";
import { DateDisplay } from "@/components/ui/atoms/DateDisplay";

interface WishlistCardProps {
  item: WishlistItem;
  onEdit: (item: WishlistItem) => void;
  onDelete: (item: WishlistItem) => void;
  onTogglePurchased: (item: WishlistItem) => void;
}

export function WishlistCard({
  item,
  onEdit,
  onDelete,
  onTogglePurchased
}: WishlistCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isPurchased = item.is_purchased;

  const cardColor = isPurchased
    ? "#10b981" // Green for purchased
    : "#a855f7"; // Purple for pending wishlist

  const calculateDaysLeft = (targetDateStr: string | null) => {
    if (!targetDateStr) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(targetDateStr);
    target.setHours(0, 0, 0, 0);
    const msDiff = target.getTime() - today.getTime();
    return Math.ceil(msDiff / (1000 * 60 * 60 * 24));
  };

  const daysLeft = calculateDaysLeft(item.target_date);
  const totalCost = item.price * item.qty;

  return (
    <FinancialCard
      cardColor={cardColor}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`border border-solid relative group transition-all duration-300 ${
        isPurchased ? "opacity-75" : ""
      }`}
    >
      <div className="w-full">
        {/* Top Header Row */}
        <div className="flex items-start justify-between relative z-10 w-full">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Quick check/uncheck button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePurchased(item);
              }}
              className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all shrink-0 cursor-pointer group/btn ${
                isPurchased
                  ? "bg-[#10b981] border-[#10b981] text-white shadow-sm shadow-[#10b981]/30"
                  : "border-border-strong hover:border-[#a855f7] bg-surface-input"
              }`}
              title={isPurchased ? "Tandai Belum Terbeli" : "Tandai Sudah Terbeli"}
            >
              <Check className={`w-4 h-4 stroke-[3] transition-colors ${
                isPurchased
                  ? "text-white"
                  : "text-text-muted/40 group-hover/btn:text-[#a855f7]"
              }`} />
            </button>

            <div className="min-w-0 flex-1">
              <h3
                className={`font-bold text-sm sm:text-base leading-tight transition-colors duration-300 truncate ${
                  isPurchased ? "line-through text-text-muted" : ""
                }`}
                style={{
                  color: isHovered && !isPurchased ? cardColor : undefined
                }}
              >
                {item.name}
              </h3>
              
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-input text-text-secondary border border-border font-medium">
                  Qty: {item.qty}
                </span>
                {isPurchased && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-success/10 text-text-success border border-text-success/20 font-medium flex items-center gap-1 animate-pulse">
                    Terbeli
                  </span>
                )}
              </div>
            </div>
          </div>

          <CardActions
            actions={[
              { icon: Edit2, label: "Edit Barang", onClick: () => onEdit(item) },
              { icon: Trash2, label: "Hapus Barang", variant: "danger", onClick: () => onDelete(item) }
            ]}
            position="top-right"
            revealOn="group-hover"
          />
        </div>

        {/* Pricing Info */}
        <div className="mt-5 space-y-2 relative z-10 w-full">
          <div className="flex justify-between text-xs">
            <div>
              <p className="text-[10px] text-text-muted uppercase tracking-wider block font-semibold">Harga Satuan</p>
              <p className="font-bold text-text-primary font-mono mt-0.5">{formatIDR(item.price)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-text-muted uppercase tracking-wider block font-semibold">Total Estimasi</p>
              <p className="font-bold text-text-primary font-mono mt-0.5" style={{ color: !isPurchased ? cardColor : undefined }}>
                {formatIDR(totalCost)}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        {item.description && (
          <div className="mt-3 bg-surface-input/50 p-2.5 rounded-xl border border-border/30 relative z-10 w-full text-xs text-text-secondary leading-relaxed">
            {item.description}
          </div>
        )}
      </div>

      {/* Bottom Footer Info */}
      <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between relative z-10 w-full">
        {item.target_date ? (
          <div className="flex items-center gap-3">
            <DateDisplay date={item.target_date} label="Target:" showIcon />
            {!isPurchased && daysLeft !== null && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                daysLeft < 0 
                  ? "bg-feedback-error/10 text-feedback-error" 
                  : daysLeft === 0 
                  ? "bg-warning/10 text-warning animate-pulse" 
                  : "bg-primary/10 text-primary"
              }`}>
                {daysLeft < 0 
                  ? `Lewat ${Math.abs(daysLeft)} hari` 
                  : daysLeft === 0 
                  ? "Hari ini!" 
                  : `${daysLeft} hari lagi`
                }
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center text-[10px] text-text-muted gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Tanpa target tanggal
          </div>
        )}

        <div className="flex items-center gap-1 text-[10px] text-text-muted">
          <Gift className="w-3 h-3 text-text-muted" />
          Wishlist
        </div>
      </div>
    </FinancialCard>
  );
}

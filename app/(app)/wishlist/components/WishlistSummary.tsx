import { WishlistItem } from "../types";
import { formatIDR } from "@/lib/utils/format";
import { InfoCard } from "@/components/ui/molecules/InfoCard";

interface WishlistSummaryProps {
  wishlist: WishlistItem[];
  isLoading?: boolean;
}

export function WishlistSummary({ wishlist, isLoading = false }: WishlistSummaryProps) {
  const totalPendingCost = wishlist
    .filter(item => !item.is_purchased)
    .reduce((sum, item) => sum + (item.price * item.qty), 0);

  const totalCost = wishlist
    .reduce((sum, item) => sum + (item.price * item.qty), 0);

  const totalCount = wishlist.length;
  const purchasedCount = wishlist.filter(item => item.is_purchased).length;
  const pendingCount = totalCount - purchasedCount;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <InfoCard
        title="Dana yang Dibutuhkan"
        value={formatIDR(totalPendingCost)}
        variant="primary"
        description="Total harga barang belum terbeli"
        isLoading={isLoading}
      />

      <InfoCard
        title="Total Nilai Wishlist"
        value={formatIDR(totalCost)}
        variant="neutral"
        description="Total seluruh barang di wishlist"
        isLoading={isLoading}
      />

      <InfoCard
        title="Menunggu Dibeli"
        value={`${pendingCount} Barang`}
        variant="warning"
        description="Barang impian yang masih ditunda"
        isLoading={isLoading}
      />

      <InfoCard
        title="Sudah Terbeli"
        value={`${purchasedCount} Barang`}
        variant="success"
        description="Barang impian yang sudah didapatkan"
        isLoading={isLoading}
      />
    </div>
  );
}

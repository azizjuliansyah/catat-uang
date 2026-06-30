import { Plus, Heart } from "lucide-react";
import { Button } from "@/components/ui/atoms/Button";
import { PageHeader } from "@/components/ui/molecules/PageHeader";

interface WishlistHeaderProps {
  onAddClick: () => void;
}

export function WishlistHeader({ onAddClick }: WishlistHeaderProps) {
  return (
    <PageHeader
      icon={Heart}
      title="Daftar Keinginan (Wishlist)"
      description="Catat barang impian Anda, pantau harga, dan rencanakan tanggal pembelian."
      actions={
        <Button onClick={onAddClick} size="sm">
          <Plus className="w-4 h-4 mr-1.5" />
          Barang Baru
        </Button>
      }
    />
  );
}

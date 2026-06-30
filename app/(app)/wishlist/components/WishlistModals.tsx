import { Modal } from "@/components/ui/organisms/Modal";
import { FormField } from "@/components/ui/molecules/FormField";
import { Input } from "@/components/ui/atoms/Input";
import { Textarea } from "@/components/ui/atoms/Textarea";
import { CurrencyInput } from "@/components/ui/atoms/CurrencyInput";
import { DatetimeInput } from "@/components/ui/atoms/DatetimeInput";
import { Select } from "@/components/ui/atoms/Select";
import { ModalFooter } from "@/components/ui/molecules/ModalFooter";
import { WishlistItem } from "../types";
import { AlertCircle, CheckCircle, Gift } from "lucide-react";
import { formatIDR } from "@/lib/utils/format";

interface WishlistModalsProps {
  // Add / Edit Modal
  isAddModalOpen: boolean;
  isEditModalOpen: boolean;
  formName: string;
  setFormName: (v: string) => void;
  formQty: string;
  setFormQty: (v: string) => void;
  formPrice: string;
  setFormPrice: (v: string) => void;
  formTargetDate: string;
  setFormTargetDate: (v: string) => void;
  formDescription: string;
  setFormDescription: (v: string) => void;
  editingWishlist: WishlistItem | null;
  submittingWishlist: boolean;
  onSubmitWishlist: (e: React.FormEvent) => void;
  closeAllModals: () => void;

  // Toggle Purchased Modal
  isPurchaseConfirmModalOpen: boolean;
  isUnpurchaseConfirmModalOpen: boolean;
  wishlistToToggle: WishlistItem | null;
  purchaseWalletId: string;
  setPurchaseWalletId: (id: string) => void;
  submittingToggle: boolean;
  onPurchaseConfirm: () => void;
  onUnpurchaseConfirm: () => void;
  wallets: Array<{ id: string; name: string; balance: number }>;

  // Delete Modal
  wishlistToDelete: WishlistItem | null;
  setWishlistToDelete: (item: WishlistItem | null) => void;
  isDeleteSubmitting: boolean;
  onDeleteConfirm: () => void;
}

export function WishlistModals({
  isAddModalOpen,
  isEditModalOpen,
  formName,
  setFormName,
  formQty,
  setFormQty,
  formPrice,
  setFormPrice,
  formTargetDate,
  setFormTargetDate,
  formDescription,
  setFormDescription,
  editingWishlist,
  submittingWishlist,
  onSubmitWishlist,
  closeAllModals,

  isPurchaseConfirmModalOpen,
  isUnpurchaseConfirmModalOpen,
  wishlistToToggle,
  purchaseWalletId,
  setPurchaseWalletId,
  submittingToggle,
  onPurchaseConfirm,
  onUnpurchaseConfirm,
  wallets,

  wishlistToDelete,
  setWishlistToDelete,
  isDeleteSubmitting,
  onDeleteConfirm
}: WishlistModalsProps) {
  const isOpen = isAddModalOpen || isEditModalOpen;
  const isEdit = isEditModalOpen;

  return (
    <>
      {/* Form Modal */}
      <Modal
        isOpen={isOpen}
        onClose={closeAllModals}
        title={isEdit ? "Edit Barang Wishlist" : "Tambah Barang ke Wishlist"}
        onSubmit={onSubmitWishlist}
        footer={
          <ModalFooter
            onCancel={closeAllModals}
            isSubmitting={submittingWishlist}
            submitText={isEdit ? "Simpan Perubahan" : "Tambah ke Daftar"}
          />
        }
      >
        <div className="space-y-4">
          <FormField
            label="Nama Barang Impian"
            required
          >
            <Input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Contoh: iPhone 17 Pro, Sepatu Roda, Tiket Konser"
            />
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Kuantitas (Qty)"
              required
            >
              <Input
                type="number"
                min="1"
                step="1"
                value={formQty}
                onChange={(e) => setFormQty(e.target.value)}
                placeholder="1"
              />
            </FormField>

            <FormField
              label="Harga Satuan (Rupiah)"
              required
            >
              <CurrencyInput
                value={formPrice}
                onChange={(e) => setFormPrice(e.target.value)}
                placeholder="0"
              />
            </FormField>
          </div>

          <FormField
            label="Target Terbeli (Opsional)"
          >
            <DatetimeInput
              value={formTargetDate}
              onChange={(e) => setFormTargetDate(e.target.value)}
            />
          </FormField>

          <FormField
            label="Deskripsi / Catatan Tambahan (Opsional)"
          >
            <Textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Detail warna, ukuran, link toko, atau alasan ingin membeli barang ini..."
              rows={3}
              resize="vertical"
            />
          </FormField>
        </div>
      </Modal>

      {/* Purchase Confirm Modal */}
      <Modal
        isOpen={isPurchaseConfirmModalOpen}
        onClose={closeAllModals}
        title="Tandai Barang Sudah Terbeli?"
        onSubmit={(e) => {
          e.preventDefault();
          onPurchaseConfirm();
        }}
        footer={
          <ModalFooter
            onCancel={closeAllModals}
            isSubmitting={submittingToggle}
            submitText="Tandai Terbeli"
          />
        }
      >
        <div className="space-y-4">
          <div className="bg-success/10 text-text-success border border-text-success/20 p-3.5 rounded-xl text-xs leading-relaxed flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 mt-0.5 shrink-0 text-[#10b981]" />
            <div>
              Anda akan menandai barang <span className="font-semibold text-text-primary">{wishlistToToggle?.name}</span> sebagai terbeli. Hal ini akan memotong saldo dompet yang Anda pilih.
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs bg-surface-input p-3.5 rounded-xl border border-border/30">
            <div>
              <p className="text-text-muted">Total Belanja</p>
              <p className="font-bold text-text-primary text-sm font-mono mt-0.5">
                {wishlistToToggle ? formatIDR(wishlistToToggle.price * wishlistToToggle.qty) : "Rp 0"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-text-muted">Barang ({wishlistToToggle?.qty}x)</p>
              <p className="font-bold text-text-primary text-sm mt-0.5 truncate">{wishlistToToggle?.name}</p>
            </div>
          </div>

          <FormField
            label="Pilih Dompet Pembayaran"
            required
          >
            <Select
              value={purchaseWalletId}
              onChange={(e) => setPurchaseWalletId(e.target.value)}
              required
            >
              {wallets.map(w => (
                <option key={w.id} value={w.id}>
                  {w.name} ({formatIDR(w.balance)})
                </option>
              ))}
              {wallets.length === 0 && (
                <option value="" disabled>Belum ada dompet aktif</option>
              )}
            </Select>
          </FormField>
        </div>
      </Modal>

      {/* Unpurchase Confirm Modal */}
      <Modal
        isOpen={isUnpurchaseConfirmModalOpen}
        onClose={closeAllModals}
        title="Batalkan Pembelian Barang?"
        onSubmit={(e) => {
          e.preventDefault();
          onUnpurchaseConfirm();
        }}
        footer={
          <ModalFooter
            onCancel={closeAllModals}
            isSubmitting={submittingToggle}
            submitText="Batalkan Pembelian"
            variant="destructive"
          />
        }
      >
        <div className="space-y-4">
          <div className="bg-warning/10 text-warning border border-warning/20 p-3.5 rounded-xl text-xs leading-relaxed flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-warning" />
            <div>
              Apakah Anda yakin ingin membatalkan status pembelian barang <span className="font-semibold text-text-primary">{wishlistToToggle?.name}</span>?
            </div>
          </div>

          <p className="text-xs text-text-secondary leading-relaxed">
            Tindakan ini akan menghapus transaksi pengeluaran terkait dan **mengembalikan saldo** ke dompet yang digunakan sebelumnya secara otomatis.
          </p>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={wishlistToDelete !== null}
        onClose={() => setWishlistToDelete(null)}
        title="Hapus Barang dari Wishlist?"
        isDestructive
        footer={
          <ModalFooter
            onCancel={() => setWishlistToDelete(null)}
            onSubmit={onDeleteConfirm}
            isSubmitting={isDeleteSubmitting}
            cancelText="Batal"
            submitText="Hapus"
            variant="destructive"
          />
        }
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-md bg-danger/10 text-danger flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="flex-1 text-sm text-text-secondary leading-relaxed">
            <p>
              Apakah Anda yakin ingin menghapus barang <span className="font-bold text-text-primary">{wishlistToDelete?.name}</span> dari daftar keinginan Anda?
            </p>
            <p className="mt-2 text-xs text-text-muted">
              Tindakan ini permanen dan tidak dapat dibatalkan.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}

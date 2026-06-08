"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getIconComponent, iconMap } from "@/lib/utils/icons";
import { 
  Plus, 
  ArrowRightLeft, 
  Edit2, 
  Trash2, 
  Archive, 
  RotateCcw, 
  Check, 
  AlertCircle, 
  Info,
  Wallet as DefaultWalletIcon,
  X
} from "lucide-react";

interface WalletItem {
  id: string;
  user_id: string;
  name: string;
  balance: number;
  initial_balance: number;
  icon: string;
  color: string;
  is_default: boolean;
  is_archived: boolean;
  created_at: string;
}

const PRESETS = {
  colors: [
    { name: "Blue", hex: "#0C5CAB" },
    { name: "Green", hex: "#10B981" },
    { name: "Purple", hex: "#8B5CF6" },
    { name: "Red", hex: "#EF4444" },
    { name: "Orange", hex: "#F59E0B" },
    { name: "Cyan", hex: "#06B6D4" },
    { name: "Gray", hex: "#6B7280" }
  ],
  icons: ["Wallet", "CreditCard", "Banknote", "Coins", "PiggyBank", "Building", "Smartphone"]
};

export default function WalletsPage() {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  
  // Data State
  const [wallets, setWallets] = useState<WalletItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [walletToDelete, setWalletToDelete] = useState<WalletItem | null>(null);

  // Form State - Add
  const [addName, setAddName] = useState("");
  const [addInitialBalance, setAddInitialBalance] = useState("0");
  const [addIcon, setAddIcon] = useState("Wallet");
  const [addColor, setAddColor] = useState("#0C5CAB");
  const [addIsDefault, setAddIsDefault] = useState(false);
  const [addSubmitting, setAddSubmitting] = useState(false);

  // Form State - Edit
  const [editingWallet, setEditingWallet] = useState<WalletItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("Wallet");
  const [editColor, setEditColor] = useState("#0C5CAB");
  const [editIsDefault, setEditIsDefault] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Form State - Transfer
  const [tfSourceId, setTfSourceId] = useState("");
  const [tfDestId, setTfDestId] = useState("");
  const [tfAmount, setTfAmount] = useState("");
  const [tfDescription, setTfDescription] = useState("");
  const [tfDate, setTfDate] = useState(new Date().toISOString().split("T")[0]);
  const [tfSubmitting, setTfSubmitting] = useState(false);

  // Fetch wallets
  async function fetchWallets() {
    try {
      setLoading(true);
      setErrorMsg(null);
      const { data, error } = await supabase
        .from("wallets")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      setWallets(data || []);
    } catch (err: any) {
      console.error("Error fetching wallets:", err);
      setErrorMsg("Gagal memuat daftar dompet: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  // Load User & Wallets on init
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        await fetchWallets();
      }
    }
    init();
  }, []);

  // Show Toast helpers
  const showToast = (message: string, isSuccess = true) => {
    if (isSuccess) {
      setSuccessMsg(message);
      setTimeout(() => setSuccessMsg(null), 3000);
    } else {
      setErrorMsg(message);
      setTimeout(() => setErrorMsg(null), 4000);
    }
  };

  // 1. ADD WALLET SUBMIT
  const handleAddWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim()) {
      showToast("Nama dompet tidak boleh kosong", false);
      return;
    }
    if (!user) return;

    try {
      setAddSubmitting(true);
      const newWallet = {
        user_id: user.id,
        name: addName.trim(),
        initial_balance: parseFloat(addInitialBalance) || 0,
        icon: addIcon,
        color: addColor,
        is_default: addIsDefault,
        is_archived: false
      };

      const { data, error } = await supabase
        .from("wallets")
        .insert([newWallet])
        .select();

      if (error) throw error;

      showToast("Dompet baru berhasil ditambahkan!");
      setIsAddModalOpen(false);
      // Reset form
      setAddName("");
      setAddInitialBalance("0");
      setAddIcon("Wallet");
      setAddColor("#0C5CAB");
      setAddIsDefault(false);
      
      await fetchWallets();
    } catch (err: any) {
      console.error(err);
      showToast("Gagal menambahkan dompet: " + err.message, false);
    } finally {
      setAddSubmitting(false);
    }
  };

  // 2. EDIT WALLET OPEN & SUBMIT
  const openEditModal = (wallet: WalletItem) => {
    setEditingWallet(wallet);
    setEditName(wallet.name);
    setEditIcon(wallet.icon);
    setEditColor(wallet.color);
    setEditIsDefault(wallet.is_default);
    setIsEditModalOpen(true);
  };

  const handleEditWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWallet) return;
    if (!editName.trim()) {
      showToast("Nama dompet tidak boleh kosong", false);
      return;
    }

    try {
      setEditSubmitting(true);
      const { error } = await supabase
        .from("wallets")
        .update({
          name: editName.trim(),
          icon: editIcon,
          color: editColor,
          is_default: editIsDefault
        })
        .eq("id", editingWallet.id);

      if (error) throw error;

      showToast("Perubahan dompet berhasil disimpan!");
      setIsEditModalOpen(false);
      await fetchWallets();
    } catch (err: any) {
      console.error(err);
      showToast("Gagal menyimpan perubahan: " + err.message, false);
    } finally {
      setEditSubmitting(false);
    }
  };

  // 3. ARCHIVE / UNARCHIVE
  const toggleArchiveWallet = async (wallet: WalletItem) => {
    try {
      const nextArchived = !wallet.is_archived;
      // If setting default wallet to archived, we should check it
      if (wallet.is_default && nextArchived) {
        showToast("Dompet utama tidak dapat diarsipkan. Ubah dompet utama terlebih dahulu.", false);
        return;
      }

      const { error } = await supabase
        .from("wallets")
        .update({ is_archived: nextArchived })
        .eq("id", wallet.id);

      if (error) throw error;

      showToast(nextArchived ? "Dompet berhasil diarsipkan" : "Dompet berhasil diaktifkan kembali");
      await fetchWallets();
    } catch (err: any) {
      console.error(err);
      showToast("Gagal merubah status arsip: " + err.message, false);
    }
  };

  // 4. SET DEFAULT
  const setDefaultWallet = async (wallet: WalletItem) => {
    if (wallet.is_archived) {
      showToast("Dompet terarsip tidak bisa dijadikan dompet utama.", false);
      return;
    }

    try {
      const { error } = await supabase
        .from("wallets")
        .update({ is_default: true })
        .eq("id", wallet.id);

      if (error) throw error;

      showToast(`Dompet ${wallet.name} sekarang menjadi dompet utama!`);
      await fetchWallets();
    } catch (err: any) {
      console.error(err);
      showToast("Gagal menyetel dompet utama: " + err.message, false);
    }
  };

  // 5. DELETE WALLET
  const handleDeleteWallet = async () => {
    if (!walletToDelete) return;
    if (walletToDelete.is_default) {
      showToast("Dompet utama tidak dapat dihapus", false);
      setWalletToDelete(null);
      return;
    }

    try {
      const { error } = await supabase
        .from("wallets")
        .delete()
        .eq("id", walletToDelete.id);

      if (error) throw error;

      showToast(`Dompet ${walletToDelete.name} berhasil dihapus`);
      setWalletToDelete(null);
      await fetchWallets();
    } catch (err: any) {
      console.error(err);
      showToast("Gagal menghapus dompet: " + err.message, false);
    }
  };

  // 6. TRANSFER SALDO SUBMIT
  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tfSourceId || !tfDestId) {
      showToast("Pilih dompet asal dan tujuan transfer", false);
      return;
    }
    if (tfSourceId === tfDestId) {
      showToast("Dompet asal dan tujuan tidak boleh sama", false);
      return;
    }
    const amount = parseFloat(tfAmount);
    if (isNaN(amount) || amount <= 0) {
      showToast("Jumlah transfer harus lebih dari 0", false);
      return;
    }

    // Check if source has sufficient funds
    const sourceWallet = wallets.find(w => w.id === tfSourceId);
    if (sourceWallet && Number(sourceWallet.balance) < amount) {
      if (!confirm(`Saldo dompet asal (${formatIDR(sourceWallet.balance)}) kurang dari jumlah transfer (${formatIDR(amount)}). Tetap lanjutkan?`)) {
        return;
      }
    }

    try {
      setTfSubmitting(true);
      const newTransfer = {
        user_id: user.id,
        from_wallet_id: tfSourceId,
        to_wallet_id: tfDestId,
        amount: amount,
        description: tfDescription.trim() || `Transfer dari ${sourceWallet?.name} ke ${wallets.find(w => w.id === tfDestId)?.name}`,
        transfer_date: tfDate
      };

      const { error } = await supabase
        .from("transfers")
        .insert([newTransfer]);

      if (error) throw error;

      showToast("Transfer saldo berhasil dilakukan!");
      setIsTransferModalOpen(false);
      // Reset form
      setTfAmount("");
      setTfDescription("");
      
      await fetchWallets();
    } catch (err: any) {
      console.error(err);
      showToast("Gagal melakukan transfer: " + err.message, false);
    } finally {
      setTfSubmitting(false);
    }
  };

  // Format IDR Helper
  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  // Filter wallets based on tab
  const filteredWallets = wallets.filter(w => 
    activeTab === "active" ? !w.is_archived : w.is_archived
  );

  const activeWalletsTotal = wallets
    .filter(w => !w.is_archived)
    .reduce((sum, w) => sum + Number(w.balance), 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Toast Notification Container */}
      {(successMsg || errorMsg) && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          {successMsg && (
            <div className="flex items-center gap-2 px-4 py-3 bg-success/15 border border-success/30 text-success rounded-xl shadow-xl backdrop-blur-md">
              <Check className="w-4 h-4 shrink-0" />
              <span className="text-sm font-medium">{successMsg}</span>
            </div>
          )}
          {errorMsg && (
            <div className="flex items-center gap-2 px-4 py-3 bg-danger/15 border border-danger/30 text-danger rounded-xl shadow-xl backdrop-blur-md">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="text-sm font-medium">{errorMsg}</span>
            </div>
          )}
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Kelola Dompet</h1>
          <p className="text-sm text-text-secondary mt-1">
            Total saldo aktif: <span className="font-semibold text-text-primary font-mono">{formatIDR(activeWalletsTotal)}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              // Pre-select first wallet if exists
              const activeList = wallets.filter(w => !w.is_archived);
              if (activeList.length > 0) {
                setTfSourceId(activeList[0].id);
                setTfDestId(activeList[1]?.id || "");
              }
              setIsTransferModalOpen(true);
            }}
            disabled={wallets.filter(w => !w.is_archived).length < 2}
            className="flex items-center gap-2 px-4 py-2 bg-surface-input hover:bg-surface-hover disabled:opacity-50 disabled:pointer-events-none border border-border hover:border-border-strong rounded-xl text-sm font-medium transition-colors cursor-pointer"
          >
            <ArrowRightLeft className="w-4 h-4" />
            Transfer Saldo
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-medium transition-colors hover:shadow-lg hover:shadow-primary/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tambah Dompet
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="border-b border-border flex gap-4">
        <button
          onClick={() => setActiveTab("active")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === "active" 
              ? "border-primary text-primary" 
              : "border-transparent text-text-secondary hover:text-text-primary"
          }`}
        >
          Aktif ({wallets.filter(w => !w.is_archived).length})
        </button>
        <button
          onClick={() => setActiveTab("archived")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === "archived" 
              ? "border-primary text-primary" 
              : "border-transparent text-text-secondary hover:text-text-primary"
          }`}
        >
          Terarsip ({wallets.filter(w => w.is_archived).length})
        </button>
      </div>

      {/* Grid List of Wallets */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-40 bg-surface-card border border-border rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredWallets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 border border-dashed border-border rounded-2xl text-center">
          <div className="w-12 h-12 rounded-full bg-surface-hover flex items-center justify-center text-text-muted mb-3">
            <DefaultWalletIcon className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-text-primary">Tidak ada dompet ditemukan</h3>
          <p className="text-sm text-text-secondary mt-1 max-w-sm">
            {activeTab === "active" 
              ? "Tambahkan dompet pertama Anda untuk mulai mencatat dan mengelola keuangan Anda."
              : "Belum ada dompet yang Anda arsipkan."}
          </p>
          {activeTab === "active" && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-4 inline-flex items-center gap-1 text-sm text-primary font-semibold hover:underline"
            >
              Tambah dompet baru →
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWallets.map((wallet) => {
            const WalletIcon = getIconComponent(wallet.icon);
            return (
              <div 
                key={wallet.id}
                className="bg-surface-card border border-border hover:border-border-strong rounded-2xl p-5 flex flex-col justify-between h-44 transition-all shadow-sm hover:shadow-md relative overflow-hidden group"
              >
                {/* Visual Accent Bar */}
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1.5"
                  style={{ backgroundColor: wallet.color }}
                />

                {/* Card Top */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${wallet.color}20`, color: wallet.color }}
                    >
                      <WalletIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-primary line-clamp-1 group-hover:text-primary transition-colors">
                        {wallet.name}
                      </h3>
                      {wallet.is_default && (
                        <span className="inline-block px-1.5 py-0.5 text-xxs font-semibold bg-primary/10 text-primary border border-primary/20 rounded-md mt-0.5">
                          Utama
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Settings / Actions */}
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => openEditModal(wallet)}
                      title="Edit Dompet"
                      className="p-1.5 text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface-hover transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => toggleArchiveWallet(wallet)}
                      title={wallet.is_archived ? "Aktifkan" : "Arsipkan"}
                      className="p-1.5 text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface-hover transition-colors"
                    >
                      {wallet.is_archived ? (
                        <RotateCcw className="w-3.5 h-3.5" />
                      ) : (
                        <Archive className="w-3.5 h-3.5" />
                      )}
                    </button>
                    {!wallet.is_default && (
                      <button 
                        onClick={() => setWalletToDelete(wallet)}
                        title="Hapus"
                        className="p-1.5 text-text-secondary hover:text-danger rounded-lg hover:bg-danger/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Card Bottom */}
                <div className="mt-4 flex flex-col justify-end pt-2 border-t border-border/40">
                  <span className="text-xxs text-text-secondary">Saldo</span>
                  <span className="text-xl font-bold text-text-primary font-mono truncate mt-0.5">
                    {formatIDR(wallet.balance)}
                  </span>
                  
                  {/* Quick toggle to set default if not default & active */}
                  {!wallet.is_default && !wallet.is_archived && (
                    <button
                      onClick={() => setDefaultWallet(wallet)}
                      className="text-left text-xxs text-primary hover:underline mt-2 font-semibold flex items-center gap-0.5"
                    >
                      Setel Utama
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= MODAL: ADD WALLET ================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-card border border-border rounded-2xl w-full max-w-md shadow-2xl p-6 relative animate-in scale-in duration-200">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-text-secondary hover:text-text-primary"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-text-primary mb-4">Tambah Dompet Baru</h2>

            <form onSubmit={handleAddWallet} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Nama Dompet <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Dompet Utama, GoPay, BCA"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-surface-input border border-border focus:border-primary focus:outline-none rounded-xl text-sm text-text-primary font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Saldo Awal (Rp)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={addInitialBalance}
                  onChange={(e) => setAddInitialBalance(e.target.value)}
                  className="w-full px-3.5 py-2 bg-surface-input border border-border focus:border-primary focus:outline-none rounded-xl text-sm text-text-primary font-mono"
                />
                <p className="text-xxs text-text-muted mt-1">Saldo awal tidak bisa diubah setelah dibuat. Saldo saat ini akan otomatis disesuaikan.</p>
              </div>

              {/* Icon Selector Grid */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-2">
                  Pilih Ikon
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {PRESETS.icons.map((iconName) => {
                    const IconComp = getIconComponent(iconName);
                    const isSelected = addIcon === iconName;
                    return (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setAddIcon(iconName)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
                          isSelected 
                            ? "bg-primary border-primary text-white" 
                            : "bg-surface-input border-border hover:border-border-strong text-text-secondary hover:text-text-primary"
                        }`}
                      >
                        <IconComp className="w-5 h-5" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Selector Picker */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-2">
                  Warna Dompet
                </label>
                <div className="flex flex-wrap gap-2 items-center">
                  {PRESETS.colors.map((color) => {
                    const isSelected = addColor === color.hex;
                    return (
                      <button
                        key={color.hex}
                        type="button"
                        onClick={() => setAddColor(color.hex)}
                        style={{ backgroundColor: color.hex }}
                        className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer relative ${
                          isSelected ? "border-white scale-110 shadow-lg" : "border-transparent"
                        }`}
                        title={color.name}
                      >
                        {isSelected && (
                          <Check className="w-4 h-4 text-white absolute inset-0 m-auto" />
                        )}
                      </button>
                    );
                  })}
                  
                  {/* Custom color input */}
                  <div className="flex items-center gap-1.5 ml-auto border border-border bg-surface-input px-2.5 py-1 rounded-xl">
                    <input
                      type="color"
                      value={addColor}
                      onChange={(e) => setAddColor(e.target.value)}
                      className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <input 
                      type="text" 
                      value={addColor.toUpperCase()} 
                      onChange={(e) => setAddColor(e.target.value)}
                      placeholder="#0C5CAB"
                      className="bg-transparent border-0 outline-none w-16 text-xxs font-mono text-text-primary text-right"
                    />
                  </div>
                </div>
              </div>

              {/* Set as Default checkbox */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="addIsDefault"
                  checked={addIsDefault}
                  onChange={(e) => setAddIsDefault(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary w-4 h-4 bg-surface-input"
                />
                <label htmlFor="addIsDefault" className="text-xs font-semibold text-text-secondary select-none cursor-pointer">
                  Jadikan sebagai dompet utama (Utama)
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2 border border-border hover:bg-surface-hover text-text-primary rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={addSubmitting}
                  className="flex-1 py-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                >
                  {addSubmitting ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT WALLET ================= */}
      {isEditModalOpen && editingWallet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-card border border-border rounded-2xl w-full max-w-md shadow-2xl p-6 relative animate-in scale-in duration-200">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 text-text-secondary hover:text-text-primary"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-text-primary mb-4">Edit Dompet: {editingWallet.name}</h2>

            <form onSubmit={handleEditWallet} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Nama Dompet <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-surface-input border border-border focus:border-primary focus:outline-none rounded-xl text-sm text-text-primary font-medium"
                />
              </div>

              {/* Icon Selector Grid */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-2">
                  Pilih Ikon
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {PRESETS.icons.map((iconName) => {
                    const IconComp = getIconComponent(iconName);
                    const isSelected = editIcon === iconName;
                    return (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setEditIcon(iconName)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
                          isSelected 
                            ? "bg-primary border-primary text-white" 
                            : "bg-surface-input border-border hover:border-border-strong text-text-secondary hover:text-text-primary"
                        }`}
                      >
                        <IconComp className="w-5 h-5" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Selector Picker */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-2">
                  Warna Dompet
                </label>
                <div className="flex flex-wrap gap-2 items-center">
                  {PRESETS.colors.map((color) => {
                    const isSelected = editColor === color.hex;
                    return (
                      <button
                        key={color.hex}
                        type="button"
                        onClick={() => setEditColor(color.hex)}
                        style={{ backgroundColor: color.hex }}
                        className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer relative ${
                          isSelected ? "border-white scale-110 shadow-lg" : "border-transparent"
                        }`}
                        title={color.name}
                      >
                        {isSelected && (
                          <Check className="w-4 h-4 text-white absolute inset-0 m-auto" />
                        )}
                      </button>
                    );
                  })}
                  
                  {/* Custom color input */}
                  <div className="flex items-center gap-1.5 ml-auto border border-border bg-surface-input px-2.5 py-1 rounded-xl">
                    <input
                      type="color"
                      value={editColor}
                      onChange={(e) => setEditColor(e.target.value)}
                      className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <input 
                      type="text" 
                      value={editColor.toUpperCase()} 
                      onChange={(e) => setEditColor(e.target.value)}
                      placeholder="#0C5CAB"
                      className="bg-transparent border-0 outline-none w-16 text-xxs font-mono text-text-primary text-right"
                    />
                  </div>
                </div>
              </div>

              {/* Set as Default checkbox */}
              {!editingWallet.is_default && !editingWallet.is_archived && (
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="editIsDefault"
                    checked={editIsDefault}
                    onChange={(e) => setEditIsDefault(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary w-4 h-4 bg-surface-input"
                  />
                  <label htmlFor="editIsDefault" className="text-xs font-semibold text-text-secondary select-none cursor-pointer">
                    Jadikan sebagai dompet utama (Utama)
                  </label>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2 border border-border hover:bg-surface-hover text-text-primary rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="flex-1 py-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                >
                  {editSubmitting ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: TRANSFER SALDO ================= */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-card border border-border rounded-2xl w-full max-w-md shadow-2xl p-6 relative animate-in scale-in duration-200">
            <button
              onClick={() => setIsTransferModalOpen(false)}
              className="absolute top-4 right-4 text-text-secondary hover:text-text-primary"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-primary" />
              Transfer Saldo Antar Dompet
            </h2>

            <form onSubmit={handleTransfer} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Dompet Asal <span className="text-danger">*</span>
                </label>
                <select
                  required
                  value={tfSourceId}
                  onChange={(e) => setTfSourceId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-surface-input border border-border focus:border-primary focus:outline-none rounded-xl text-sm text-text-primary font-medium"
                >
                  {wallets.filter(w => !w.is_archived).map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({formatIDR(w.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Dompet Tujuan <span className="text-danger">*</span>
                </label>
                <select
                  required
                  value={tfDestId}
                  onChange={(e) => setTfDestId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-surface-input border border-border focus:border-primary focus:outline-none rounded-xl text-sm text-text-primary font-medium"
                >
                  <option value="" disabled>Pilih dompet tujuan...</option>
                  {wallets.filter(w => !w.is_archived && w.id !== tfSourceId).map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({formatIDR(w.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Jumlah Transfer (Rp) <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="0"
                  value={tfAmount}
                  onChange={(e) => setTfAmount(e.target.value)}
                  className="w-full px-3.5 py-2 bg-surface-input border border-border focus:border-primary focus:outline-none rounded-xl text-sm text-text-primary font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Tanggal Transfer
                </label>
                <input
                  type="date"
                  required
                  value={tfDate}
                  onChange={(e) => setTfDate(e.target.value)}
                  className="w-full px-3.5 py-2 bg-surface-input border border-border focus:border-primary focus:outline-none rounded-xl text-sm text-text-primary font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Catatan (Opsional)
                </label>
                <textarea
                  placeholder="Contoh: Pindah saldo kas, top up saldo e-wallet"
                  value={tfDescription}
                  onChange={(e) => setTfDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-surface-input border border-border focus:border-primary focus:outline-none rounded-xl text-sm text-text-primary font-medium h-20 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="flex-1 py-2 border border-border hover:bg-surface-hover text-text-primary rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={tfSubmitting}
                  className="flex-1 py-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                >
                  {tfSubmitting ? "Mentransfer..." : "Kirim Transfer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= CONFIRMATION MODAL: DELETE ================= */}
      {walletToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-card border border-border rounded-2xl w-full max-w-sm shadow-2xl p-6 relative animate-in scale-in duration-200">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-danger" />
              Hapus Dompet?
            </h2>
            <p className="text-sm text-text-secondary mb-4">
              Apakah Anda yakin ingin menghapus dompet <span className="font-semibold text-text-primary">{walletToDelete.name}</span>? 
              <br/>
              Tindakan ini juga akan menghapus semua riwayat transaksi yang terkait dengan dompet ini dan tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setWalletToDelete(null)}
                className="flex-1 py-2 border border-border hover:bg-surface-hover text-text-primary rounded-xl text-sm font-semibold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteWallet}
                className="flex-1 py-2 bg-danger hover:bg-danger/90 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

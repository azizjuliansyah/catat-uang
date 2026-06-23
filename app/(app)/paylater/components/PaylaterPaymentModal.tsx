"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useApp } from "@/app/providers/AppProvider";
import { useToast } from "@/components/ui/molecules/Toast";
import { FormField } from "@/components/ui/molecules/FormField";
import { Modal } from "@/components/ui/organisms/Modal";
import { Button } from "@/components/ui/atoms/Button";
import { ModalFooter } from "@/components/ui/molecules/ModalFooter";
import { formatIDR } from "@/lib/utils/format";
import { Wallet } from "lucide-react";
import { getIconComponent } from "@/lib/utils/icons";
import { CustomSelect } from "@/components/ui/atoms/CustomSelect";

interface PaylaterPlatformItem {
  id: string;
  user_id: string;
  name: string;
  limit_amount: number;
  balance: number;
  billing_cycle_date: number;
  due_date_offset: number;
  icon: string;
  color: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

interface PaylaterTransaction {
  id: string;
  amount: number;
  type: "income" | "expense";
  description: string | null;
  transaction_date: string;
  receipt_url: string | null;
  categories: {
    id: string;
    name: string;
    icon: string;
    color: string;
  } | null;
}

interface PaylaterPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: PaylaterPlatformItem | null;
  selectedTransactionIds?: Set<string>;
  transactions?: PaylaterTransaction[];
  onPaymentSuccess: () => void;
}

export function PaylaterPaymentModal({
  isOpen,
  onClose,
  platform,
  selectedTransactionIds,
  transactions: externalTransactions,
  onPaymentSuccess
}: PaylaterPaymentModalProps) {
  const supabase = createClient();
  const { wallets, user } = useApp();
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  const [walletId, setWalletId] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Internal state used when modal is opened standalone (from list page)
  const [fetchedTransactions, setFetchedTransactions] = useState<PaylaterTransaction[]>([]);
  const [internalSelectedIds, setInternalSelectedIds] = useState<Set<string>>(new Set());
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  // Standalone mode: no external transactions provided
  const isStandalone = externalTransactions === undefined;

  const transactions = isStandalone ? fetchedTransactions : (externalTransactions ?? []);
  const activeSelectedIds = isStandalone ? internalSelectedIds : (selectedTransactionIds ?? new Set<string>());

  async function fetchTransactions() {
    if (!platform || !user) return;
    setLoadingTransactions(true);
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("id, amount, type, description, transaction_date, receipt_url, categories(id, name, icon, color)")
        .eq("paylater_id", platform.id)
        .eq("type", "expense")
        .order("transaction_date", { ascending: false });

      if (error) throw error;
      setFetchedTransactions((data as unknown as PaylaterTransaction[]) ?? []);
    } catch {
      showErrorToast("Gagal memuat daftar transaksi");
    } finally {
      setLoadingTransactions(false);
    }
  }

  useEffect(() => {
    if (!isOpen || !platform) return;

    setPaymentDate(new Date().toISOString().split("T")[0]);
    const activeWallets = wallets.filter(w => !w.is_archived);
    const defaultWallet = activeWallets.find(w => w.is_default) || activeWallets[0];
    setWalletId(defaultWallet ? defaultWallet.id : "");

    if (isStandalone) {
      setInternalSelectedIds(new Set());
      fetchTransactions();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, platform]);

  function toggleInternal(id: string) {
    setInternalSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    setInternalSelectedIds(new Set(fetchedTransactions.map(t => t.id)));
  }

  function clearAll() {
    setInternalSelectedIds(new Set());
  }

  function getErrorMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    return String(err);
  }

  const selectedTransactions = transactions.filter(t => activeSelectedIds.has(t.id));
  const totalAmount = selectedTransactions.reduce((sum, t) => sum + t.amount, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !platform) return;

    if (activeSelectedIds.size === 0) {
      showErrorToast("Silakan pilih minimal satu transaksi untuk dibayar");
      return;
    }

    if (!walletId) {
      showErrorToast("Silakan pilih dompet sumber pembayaran");
      return;
    }

    if (totalAmount <= 0) {
      showErrorToast("Jumlah pembayaran harus lebih dari 0");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: newTx, error: txError } = await supabase
        .from("transactions")
        .insert([{
          user_id: user.id,
          wallet_id: walletId,
          paylater_id: null,
          category_id: null,
          amount: totalAmount,
          type: "expense",
          description: `Bayar tagihan: ${platform.name}`,
          transaction_date: new Date(paymentDate).toISOString(),
          receipt_url: null
        }])
        .select()
        .single();

      if (txError) throw txError;

      const { error } = await supabase
        .from("paylater_payments")
        .insert({
          user_id: user.id,
          paylater_id: platform.id,
          wallet_id: walletId,
          amount: totalAmount,
          payment_date: paymentDate,
          transaction_id: newTx.id
        });

      if (error) {
        await supabase.from("transactions").delete().eq("id", newTx.id);
        throw error;
      }

      showSuccessToast(
        `Pembayaran tagihan "${platform.name}" sebesar ${formatIDR(totalAmount)} berhasil dicatat!`
      );
      onPaymentSuccess();
      onClose();
    } catch (err: unknown) {
      console.error("Error recording paylater payment:", err);
      showErrorToast("Gagal mencatat pembayaran: " + getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  const activeWallets = wallets.filter(w => !w.is_archived);
  const selectedWallet = activeWallets.find(w => w.id === walletId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Bayar Tagihan ${platform?.name || ""}`}
      onSubmit={handleSubmit}
      footer={
        <ModalFooter
          onCancel={onClose}
          isSubmitting={isSubmitting}
          disabled={activeSelectedIds.size === 0 || totalAmount <= 0}
          submitText={totalAmount > 0 ? `Bayar ${formatIDR(totalAmount)}` : "Bayar"}
        />
      }
    >
      <div className="space-y-4">
        {/* Summary */}
        {platform && (
          <div className="bg-surface-card border border-border p-4 rounded-2xl space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-text-secondary">Total Tagihan Saat Ini</span>
              <span className="text-sm font-bold text-text-primary font-mono">{formatIDR(platform.balance)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-text-secondary">Akan Dibayar</span>
              <span className="text-lg font-bold text-success font-mono">{formatIDR(totalAmount)}</span>
            </div>
            {totalAmount > 0 && totalAmount < platform.balance && (
              <div className="flex justify-between items-center text-xs text-text-secondary">
                <span>Sisa setelah pembayaran</span>
                <span className="font-mono">{formatIDR(platform.balance - totalAmount)}</span>
              </div>
            )}
          </div>
        )}

        {/* Transaction multi-select (standalone mode) */}
        {isStandalone && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Pilih Transaksi yang Akan Dibayar
              </label>
              {fetchedTransactions.length > 0 && (
                <div className="flex items-center gap-2 text-xs">
                  <button type="button" onClick={selectAll} className="text-primary hover:underline">
                    Pilih Semua
                  </button>
                  <span className="text-text-muted">•</span>
                  <button type="button" onClick={clearAll} className="text-text-secondary hover:text-text-primary">
                    Batal Pilih
                  </button>
                </div>
              )}
            </div>

            {loadingTransactions ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-12 rounded-xl bg-surface-hover animate-pulse" />
                ))}
              </div>
            ) : fetchedTransactions.length === 0 ? (
              <div className="text-center py-6 text-xs text-text-secondary border border-dashed border-border rounded-xl">
                Belum ada transaksi untuk platform ini.
              </div>
            ) : (
              <div className="space-y-1.5 pr-0.5">
                {fetchedTransactions.map((txn) => {
                  const CategoryIcon = txn.categories ? getIconComponent(txn.categories.icon) : null;
                  const isSelected = internalSelectedIds.has(txn.id);
                  return (
                    <label
                      key={txn.id}
                      className={
                        "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all " +
                        (isSelected
                          ? "bg-primary/10 border-primary/30"
                          : "bg-surface/30 border-border hover:border-border-strong")
                      }
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleInternal(txn.id)}
                        className="w-4 h-4 rounded border-border bg-surface-input text-primary focus:ring-primary focus:ring-2 cursor-pointer shrink-0"
                      />
                      {CategoryIcon && txn.categories && (
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: txn.categories.color + "20" }}
                        >
                          <CategoryIcon className="w-3.5 h-3.5" style={{ color: txn.categories.color }} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-text-primary truncate">
                          {txn.description || txn.categories?.name || "Transaksi"}
                        </p>
                        <p className="text-[10px] text-text-secondary">{txn.transaction_date}</p>
                      </div>
                      <span className="text-xs font-bold text-expense font-mono shrink-0">
                        {formatIDR(txn.amount)}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Selected transactions summary (detail page mode) */}
        {!isStandalone && selectedTransactions.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Transaksi yang Akan Dibayar ({selectedTransactions.length})
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {selectedTransactions.map((txn) => {
                const CategoryIcon = txn.categories ? getIconComponent(txn.categories.icon) : null;
                return (
                  <div
                    key={txn.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-surface/40 border border-border/50"
                  >
                    {CategoryIcon && txn.categories && (
                      <div
                        className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${txn.categories.color}20` }}
                      >
                        <CategoryIcon className="w-3.5 h-3.5" style={{ color: txn.categories.color }} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-text-primary truncate">
                        {txn.description || txn.categories?.name || "Transaksi"}
                      </p>
                      <p className="text-[10px] text-text-secondary">{txn.transaction_date}</p>
                    </div>
                    <span className="text-xs font-bold text-expense font-mono shrink-0">
                      {formatIDR(txn.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Wallet Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-secondary required">
            Bayar Dari Dompet
          </label>
          {activeWallets.length === 0 ? (
            <div className="text-sm text-danger bg-danger/10 border border-danger/20 p-3 rounded-xl">
              Anda tidak memiliki dompet aktif. Harap buat dompet terlebih dahulu di tab Dompet.
            </div>
          ) : (
            <CustomSelect
              value={walletId}
              onChange={setWalletId}
              options={activeWallets.map((w) => ({
                value: w.id,
                label: `${w.name} (${formatIDR(w.balance)})`,
                icon: <Wallet className="w-4 h-4 text-text-secondary" />
              }))}
              placeholder="Pilih Dompet"
            />
          )}
          {selectedWallet && totalAmount > selectedWallet.balance && (
            <p className="text-[10px] text-warning mt-1">
              ⚠️ Jumlah pembayaran melebihi saldo dompet ({formatIDR(selectedWallet.balance)})
            </p>
          )}
        </div>

        <FormField
          label="Tanggal Pembayaran"
          type="date"
          required
          value={paymentDate}
          onChange={(e) => setPaymentDate(e.target.value)}
        />
      </div>
    </Modal>
  );
}

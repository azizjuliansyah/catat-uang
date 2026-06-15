"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useApp } from "@/app/providers/AppProvider";
import { useToast } from "@/components/ui/molecules/Toast";
import { FormField } from "@/components/ui/molecules/FormField";
import { Modal } from "@/components/ui/organisms/Modal";
import { Button } from "@/components/ui/atoms/Button";
import { ActionButton } from "@/components/ui/atoms/ActionButton";
import { getIconComponent } from "@/lib/utils/icons";
import { Check } from "lucide-react";

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
  icons: ["CreditCard", "Smartphone", "Building", "Wallet", "Banknote", "Coins", "Star"]
};

interface PaylaterModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingPlatform: PaylaterPlatformItem | null;
  onSaveSuccess: () => void;
}

export function PaylaterModal({
  isOpen,
  onClose,
  editingPlatform,
  onSaveSuccess
}: PaylaterModalProps) {
  const supabase = createClient();
  const { user } = useApp();
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  const [name, setName] = useState("");
  const [limitAmount, setLimitAmount] = useState("");
  const [billingCycleDate, setBillingCycleDate] = useState("5");
  const [dueDateOffset, setDueDateOffset] = useState("15");
  const [icon, setIcon] = useState("CreditCard");
  const [color, setColor] = useState("#0C5CAB");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editingPlatform) {
        setName(editingPlatform.name);
        setLimitAmount(editingPlatform.limit_amount.toString());
        setBillingCycleDate(editingPlatform.billing_cycle_date.toString());
        setDueDateOffset(editingPlatform.due_date_offset.toString());
        setIcon(editingPlatform.icon);
        setColor(editingPlatform.color);
      } else {
        setName("");
        setLimitAmount("");
        setBillingCycleDate("5");
        setDueDateOffset("15");
        setIcon("CreditCard");
        setColor("#0C5CAB");
      }
    }
  }, [isOpen, editingPlatform]);

  function getErrorMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    return String(err);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    if (!name.trim()) {
      showErrorToast("Nama platform wajib diisi");
      return;
    }

    const parsedLimit = parseFloat(limitAmount) || 0;
    if (parsedLimit < 0) {
      showErrorToast("Batas limit tidak boleh negatif");
      return;
    }

    const billingCycle = parseInt(billingCycleDate, 10);
    if (isNaN(billingCycle) || billingCycle < 1 || billingCycle > 31) {
      showErrorToast("Tanggal siklus tagihan harus antara 1 sampai 31");
      return;
    }

    const dueOffset = parseInt(dueDateOffset, 10);
    if (isNaN(dueOffset) || dueOffset < 1 || dueOffset > 31) {
      showErrorToast("Selisih hari jatuh tempo harus antara 1 sampai 31");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingPlatform) {
        // Edit platform
        const { error } = await supabase
          .from("paylater_platforms")
          .update({
            name: name.trim(),
            limit_amount: parsedLimit,
            billing_cycle_date: billingCycle,
            due_date_offset: dueOffset,
            icon,
            color,
            updated_at: new Date().toISOString()
          })
          .eq("id", editingPlatform.id);

        if (error) throw error;
        showSuccessToast(`Platform "${name}" berhasil diperbarui!`);
      } else {
        // Add new platform
        const { error } = await supabase
          .from("paylater_platforms")
          .insert({
            user_id: user.id,
            name: name.trim(),
            limit_amount: parsedLimit,
            balance: 0,
            billing_cycle_date: billingCycle,
            due_date_offset: dueOffset,
            icon,
            color
          });

        if (error) throw error;
        showSuccessToast(`Platform "${name}" berhasil ditambahkan!`);
      }

      onSaveSuccess();
      onClose();
    } catch (err: unknown) {
      console.error("Error saving paylater platform:", err);
      showErrorToast("Gagal menyimpan platform: " + getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingPlatform ? "Sunting Platform Paylater" : "Buat Platform Paylater Baru"}
      onSubmit={handleSubmit}
      footer={
        <>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            fullWidth
            onClick={onClose}
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            fullWidth
          >
            Simpan
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <FormField
          label="Nama Platform"
          required
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Contoh: GoPay Later, Shopee PayLater, Kredivo"
        />

        <FormField
          label="Batas Limit Kredit (Rupiah)"
          type="currency"
          value={limitAmount}
          onChange={(e) => setLimitAmount(e.target.value)}
          placeholder="0"
          helperText="Batas maksimal penggunaan dana kredit pada platform ini."
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Tanggal Siklus Tagihan"
            required
            type="number"
            min="1"
            max="31"
            value={billingCycleDate}
            onChange={(e) => setBillingCycleDate(e.target.value)}
            placeholder="5"
            helperText="Tanggal cetak tagihan bulanan (1-31)."
          />

          <FormField
            label="Jatuh Tempo (Hari)"
            required
            type="number"
            min="1"
            max="31"
            value={dueDateOffset}
            onChange={(e) => setDueDateOffset(e.target.value)}
            placeholder="15"
            helperText="Jumlah hari sejak tanggal cetak (1-31)."
          />
        </div>

        {/* Icon Selector Grid */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-text-secondary">Pilih Ikon</label>
          <div className="grid grid-cols-7 gap-2">
            {PRESETS.icons.map((iconName) => {
              const IconComp = getIconComponent(iconName);
              const isSelected = icon === iconName;
              return (
                <ActionButton
                  key={iconName}
                  icon={IconComp}
                  title={iconName}
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIcon(iconName)}
                  className={isSelected
                    ? "!bg-primary !border-primary !text-white hover:!bg-primary-hover"
                    : "bg-surface-input border border-border hover:border-border-strong"}
                />
              );
            })}
          </div>
        </div>

        {/* Color Selector Picker */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-text-secondary">Warna Tampilan</label>
          <div className="flex flex-wrap gap-2 items-center">
            {PRESETS.colors.map((c) => {
              const isSelected = color.toLowerCase() === c.hex.toLowerCase();
              return (
                <Button
                  key={c.hex}
                  type="button"
                  variant="ghost"
                  onClick={() => setColor(c.hex)}
                  style={{ backgroundColor: c.hex }}
                  className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer relative min-h-0 h-auto p-0 ${isSelected ? "border-white scale-110 shadow-lg" : "border-transparent"
                    }`}
                  title={c.name}
                >
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-white absolute inset-0 m-auto" />
                  )}
                </Button>
              );
            })}

            {/* Custom color input */}
            <div className="flex items-center gap-1.5 ml-auto border border-border bg-surface-input px-2.5 py-1.5 rounded-xl">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
              />
              <input
                type="text"
                value={color.toUpperCase()}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#0C5CAB"
                className="bg-transparent border-0 outline-none w-16 text-[10px] font-mono text-text-primary text-right"
              />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

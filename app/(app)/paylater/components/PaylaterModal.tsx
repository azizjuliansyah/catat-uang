"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/app/providers/AppProvider";
import { useToast } from "@/components/ui/molecules/Toast";
import { FormField } from "@/components/ui/molecules/FormField";
import { CurrencyInput } from "@/components/ui/atoms/CurrencyInput";
import { Input } from "@/components/ui/atoms/Input";
import { Modal } from "@/components/ui/organisms/Modal";
import { IconSelector } from "@/components/ui/molecules/IconSelector";
import { ColorPicker } from "@/components/ui/molecules/ColorPicker";
import { ModalFooter } from "@/components/ui/molecules/ModalFooter";
import { createPaylaterPlatform, updatePaylaterPlatform } from "../services";
import { PaylaterPlatform } from "../types";
import { getErrorMessage, PAYLATER_PRESETS } from "../utils";

interface PaylaterModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingPlatform: PaylaterPlatform | null;
  onSaveSuccess: () => void;
}

export function PaylaterModal({
  isOpen,
  onClose,
  editingPlatform,
  onSaveSuccess
}: PaylaterModalProps) {
  const supabase = require("@/lib/supabase/client").createClient();
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
        await updatePaylaterPlatform(supabase, editingPlatform.id, {
          name: name.trim(),
          limit_amount: parsedLimit,
          billing_cycle_date: billingCycle,
          due_date_offset: dueOffset,
          icon,
          color,
        });
        showSuccessToast(`Platform "${name}" berhasil diperbarui!`);
      } else {
        await createPaylaterPlatform(supabase, {
          user_id: user.id,
          name: name.trim(),
          limit_amount: parsedLimit,
          billing_cycle_date: billingCycle,
          due_date_offset: dueOffset,
          icon,
          color,
        });
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
      title={editingPlatform ? "Edit Platform Paylater" : "Buat Platform Paylater Baru"}
      onSubmit={handleSubmit}
      footer={
        <ModalFooter
          onCancel={onClose}
          isSubmitting={isSubmitting}
          submitText={editingPlatform ? "Simpan Perubahan" : "Buat Platform"}
        />
      }
    >
      <div className="space-y-4 w-full">
        <FormField
          label="Nama Platform"
          required
        >
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: GoPay Later, Shopee PayLater, Kredivo"
          />
        </FormField>

        <FormField
          label="Batas Limit Kredit (Rupiah)"
          helperText="Batas maksimal penggunaan dana kredit pada platform ini."
        >
          <CurrencyInput
            value={limitAmount}
            onChange={(e) => setLimitAmount(e.target.value)}
            placeholder="0"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Tanggal Siklus Tagihan"
            required
            helperText="Tanggal cetak tagihan bulanan (1-31)."
          >
            <Input
              type="number"
              min="1"
              max="31"
              value={billingCycleDate}
              onChange={(e) => setBillingCycleDate(e.target.value)}
              placeholder="5"
            />
          </FormField>

          <FormField
            label="Jatuh Tempo (Hari)"
            required
            helperText="Jumlah hari sejak tanggal cetak (1-31)."
          >
            <Input
              type="number"
              min="1"
              max="31"
              value={dueDateOffset}
              onChange={(e) => setDueDateOffset(e.target.value)}
              placeholder="15"
            />
          </FormField>
        </div>

        <IconSelector
          icons={PAYLATER_PRESETS.icons}
          selected={icon}
          onSelect={setIcon}
          label="Pilih Ikon"
        />

        <ColorPicker
          colors={PAYLATER_PRESETS.colors}
          selected={color}
          onSelect={setColor}
          label="Warna Tampilan"
          allowCustom
        />
      </div>
    </Modal>
  );
}

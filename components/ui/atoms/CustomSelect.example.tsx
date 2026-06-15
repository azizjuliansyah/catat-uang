/**
 * CustomSelect Component Examples
 *
 * This file demonstrates how to use the CustomSelect component in your app.
 */

import { useState } from "react";
import { CustomSelect, SelectOption } from "./CustomSelect";
import { FormField } from "@/components/ui/molecules/FormField";
import { getIconComponent } from "@/lib/utils/icons";

// ============================================
// Example 1: Basic Usage
// ============================================
export function BasicSelectExample() {
  const [value, setValue] = useState("");

  const options: SelectOption[] = [
    { value: "wallet1", label: "Dompet Utama" },
    { value: "wallet2", label: "Bank BCA" },
    { value: "wallet3", label: "GoPay" },
  ];

  return (
    <div className="w-full max-w-md">
      <CustomSelect
        options={options}
        value={value}
        onChange={setValue}
        placeholder="Pilih dompet"
      />
    </div>
  );
}

// ============================================
// Example 2: With Icons
// ============================================
export function IconSelectExample() {
  const [value, setValue] = useState("");

  const options: SelectOption[] = [
    { value: "food", label: "Makanan", icon: "🍔" },
    { value: "transport", label: "Transportasi", icon: "🚗" },
    { value: "shopping", label: "Belanja", icon: "🛒" },
    { value: "bills", label: "Tagihan", icon: "📄" },
  ];

  return (
    <div className="w-full max-w-md">
      <CustomSelect
        options={options}
        value={value}
        onChange={setValue}
        placeholder="Pilih kategori"
      />
    </div>
  );
}

// ============================================
// Example 3: Using Dynamic Icons (from your icon system)
// ============================================
export function DynamicIconSelectExample() {
  const [value, setValue] = useState("");

  // Using your existing icon mapping system
  // Note: Icons must be rendered as JSX elements
  const WalletIcon = getIconComponent("wallet");
  const CardIcon = getIconComponent("credit-card");
  const BankIcon = getIconComponent("building-2");

  const categoryOptions: SelectOption[] = [
    { value: "wallet", label: "Dompet", icon: <WalletIcon className="w-4 h-4" /> },
    { value: "card", label: "Kartu", icon: <CardIcon className="w-4 h-4" /> },
    { value: "bank", label: "Bank", icon: <BankIcon className="w-4 h-4" /> },
  ];

  return (
    <div className="w-full max-w-md">
      <CustomSelect
        options={categoryOptions}
        value={value}
        onChange={setValue}
        placeholder="Pilih tipe"
      />
    </div>
  );
}

// ============================================
// Example 4: With FormField (Recommended)
// ============================================
export function FormFieldSelectExample() {
  const [formData, setFormData] = useState({
    wallet: "",
    category: "",
  });

  const walletOptions: SelectOption[] = [
    { value: "w1", label: "Dompet Utama" },
    { value: "w2", label: "Bank BCA" },
  ];

  const categoryOptions: SelectOption[] = [
    { value: "income", label: "Pemasukan" },
    { value: "expense", label: "Pengeluaran" },
    { value: "transfer", label: "Transfer" },
  ];

  return (
    <div className="w-full max-w-md space-y-4">
      <FormField
        type="custom-select"
        label="Dompet"
        name="wallet"
        options={walletOptions}
        value={formData.wallet}
        onChange={(e) => setFormData({ ...formData, wallet: e.target.value })}
        placeholder="Pilih dompet"
        required
      />

      <FormField
        type="custom-select"
        label="Kategori"
        name="category"
        options={categoryOptions}
        value={formData.category}
        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        placeholder="Pilih kategori"
        clearable
      />
    </div>
  );
}

// ============================================
// Example 5: With Error State
// ============================================
export function ErrorStateExample() {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  const options: SelectOption[] = [
    { value: "option1", label: "Opsi 1" },
    { value: "option2", label: "Opsi 2" },
  ];

  const validate = (val: string) => {
    if (!val) setError("Pilih salah satu opsi");
    else setError("");
  };

  return (
    <div className="w-full max-w-md">
      <FormField
        type="custom-select"
        label="Pilihan"
        name="choice"
        options={options}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          validate(e.target.value);
        }}
        onBlur={() => validate(value)}
        error={error}
        placeholder="Pilih opsi"
        required
      />
    </div>
  );
}

// ============================================
// Example 6: Different Sizes
// ============================================
export function SizeVariantsExample() {
  const [value, setValue] = useState("");

  const options: SelectOption[] = [
    { value: "1", label: "Option 1" },
    { value: "2", label: "Option 2" },
  ];

  return (
    <div className="w-full max-w-md space-y-4">
      <CustomSelect
        size="sm"
        options={options}
        value={value}
        onChange={setValue}
        placeholder="Small (sm)"
      />

      <CustomSelect
        size="md"
        options={options}
        value={value}
        onChange={setValue}
        placeholder="Medium (md) - default"
      />

      <CustomSelect
        size="lg"
        options={options}
        value={value}
        onChange={setValue}
        placeholder="Large (lg)"
      />
    </div>
  );
}

// ============================================
// Example 7: Disabled State
// ============================================
export function DisabledExample() {
  const [value, setValue] = useState("locked");

  const options: SelectOption[] = [
    { value: "1", label: "Option 1" },
    { value: "2", label: "Option 2" },
    { value: "locked", label: "Locked Selection" },
  ];

  return (
    <div className="w-full max-w-md">
      <CustomSelect
        options={options}
        value={value}
        onChange={setValue}
        placeholder="Disabled select"
        disabled
      />
    </div>
  );
}

// ============================================
// Example 8: Disabled Options Within Select
// ============================================
export function DisabledOptionsExample() {
  const [value, setValue] = useState("");

  const options: SelectOption[] = [
    { value: "1", label: "Available Option" },
    { value: "2", label: "Disabled Option", disabled: true },
    { value: "3", label: "Another Available" },
  ];

  return (
    <div className="w-full max-w-md">
      <CustomSelect
        options={options}
        value={value}
        onChange={setValue}
        placeholder="Select with disabled options"
      />
    </div>
  );
}

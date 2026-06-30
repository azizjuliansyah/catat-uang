import { TabButton, TabButtonGroup } from "@/components/ui/molecules/TabButtonGroup";
import { TrendingDown, TrendingUp } from "lucide-react";

type TransactionType = "expense" | "income";

interface TransactionTypeSelectorProps {
  value: TransactionType;
  onChange: (value: TransactionType) => void;
  label?: string;
}

export function TransactionTypeSelector({
  value,
  onChange,
  label = "Jenis Transaksi"
}: TransactionTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
        {label}
      </label>
      <TabButtonGroup variant="pill-colored" uniformWidth className="h-10 items-center gap-1">
        <TabButton
          isActive={value === "expense"}
          onClick={() => onChange("expense")}
          variant="pill-colored"
          className={`px-2 py-0 h-full text-xs transition-all ${
            value === "expense"
              ? "bg-expense/25 border-none text-expense"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          <TrendingDown className="w-3.5 h-3.5 mr-1.5 inline" />
          Pengeluaran
        </TabButton>
        <TabButton
          isActive={value === "income"}
          onClick={() => onChange("income")}
          variant="pill-colored"
          className={`px-2 py-0 h-full text-xs transition-all ${
            value === "income"
              ? "bg-income/25 border-none text-income"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 mr-1.5 inline" />
          Pemasukan
        </TabButton>
      </TabButtonGroup>
    </div>
  );
}

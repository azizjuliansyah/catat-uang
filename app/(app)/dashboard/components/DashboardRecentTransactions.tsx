"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRightLeft, ChevronRight, Calendar, HelpCircle } from "lucide-react";
import { getIconComponent } from "@/lib/utils/icons";
import { EmptyState } from "@/components/ui/organisms/EmptyState";
import { DynamicColorIcon } from "@/components/ui/atoms/DynamicColorIcon";

import { formatDateTimeShort } from "@/lib/utils/date";

interface Transaction {
  id: string;
  amount: number;
  type: "income" | "expense";
  description: string | null;
  transaction_date: string;
  wallets: {
    name: string;
  } | null;
  paylater_platforms: {
    name: string;
  } | null;
  categories: {
    name: string;
    icon: string;
    color: string;
  } | null;
}

interface DashboardRecentTransactionsProps {
  recentTransactions: Transaction[];
}

export function DashboardRecentTransactions({ recentTransactions }: DashboardRecentTransactionsProps) {
  const router = useRouter();

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };


  return (
    <div className="space-y-4 font-sans">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5 font-display">
          <ArrowRightLeft className="w-3.5 h-3.5 text-primary" />
          Transaksi Terakhir
        </h2>
        <Link
          href="/transactions"
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5"
        >
          Semua Transaksi <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="bg-surface-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {recentTransactions.length > 0 ? (
          <div className="divide-y divide-border/40">
            {recentTransactions.map((tx) => {
              const CategoryIconComponent = tx.categories
                ? getIconComponent(tx.categories.icon)
                : HelpCircle;
              return (
                <Link
                  key={tx.id}
                  href={`/transactions/${tx.id}`}
                  className="flex items-center justify-between p-4 hover:bg-surface-hover transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    {/* Category Icon */}
                    <DynamicColorIcon
                      icon={CategoryIconComponent}
                      color={tx.categories?.color || "#6B7280"}
                      size="md"
                      variant="solid"
                    />

                    {/* Title and Date info */}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors truncate">
                        {tx.description || tx.categories?.name || "Tanpa Kategori"}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-text-secondary">
                        <span className="flex items-center gap-0.5">
                          <Calendar className="w-3 h-3" />
                          {formatDateTimeShort(tx.transaction_date)}
                        </span>
                        <span>•</span>
                        <span className="truncate max-w-[120px]">
                          {tx.wallets?.name || tx.paylater_platforms?.name || "Dompet Terhapus"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="ml-4 shrink-0 text-right flex items-center gap-2">
                    <span className={`text-sm font-bold font-mono ${
                      tx.type === "income" ? "text-income" : "text-expense"
                    }`}>
                      {tx.type === "income" ? "+" : "-"} {formatIDR(tx.amount)}
                    </span>
                    <ChevronRight className="w-4 h-4 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={ArrowRightLeft}
            title="Belum ada transaksi"
            description="Belum ada catatan transaksi pengeluaran atau pemasukan yang Anda buat."
            actionLabel="Buat Transaksi Pertama"
            onAction={() => router.push("/transactions/new")}
          />
        )}
      </div>
    </div>
  );
}

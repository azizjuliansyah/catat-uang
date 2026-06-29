import { InfoCard } from "@/components/ui/molecules/InfoCard";
import { formatIDR } from "@/lib/utils/format";
import { getIconComponent } from "@/lib/utils/icons";

interface Wallet {
  id: string;
  name: string;
  icon: string;
  color: string;
  balance: number;
  is_default: boolean;
  is_archived: boolean;
}

interface WalletDetailStatsProps {
  wallet: Wallet | null;
  currentBalance: number;
  totalIncome: number;
  totalExpense: number;
  netFlow: number;
  isLoading?: boolean;
}

export function WalletDetailStats({
  wallet,
  currentBalance,
  totalIncome,
  totalExpense,
  netFlow,
  isLoading = false,
}: WalletDetailStatsProps) {
  const WalletIconComponent = wallet ? getIconComponent(wallet.icon) : null;
  const walletColor = wallet?.color || "#6B7280";

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Balance Card Skeleton */}
        <div className="bg-surface-card border border-border rounded-2xl p-5 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-lg bg-surface-hover" />
              <div>
                <div className="h-4 bg-surface-hover rounded w-24 mb-2" />
                <div className="h-3 bg-surface-hover rounded w-32" />
              </div>
            </div>
            <div className="text-right">
              <div className="h-4 bg-surface-hover rounded w-16 mb-1" />
              <div className="h-8 bg-surface-hover rounded w-40" />
            </div>
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface-card border border-border rounded-2xl p-5 animate-pulse">
              <div className="h-4 bg-surface-hover rounded w-20 mb-2" />
              <div className="h-7 bg-surface-hover rounded w-24 mb-1" />
              <div className="h-3 bg-surface-hover rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Balance Card */}
      <div className="bg-surface-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-lg flex items-center justify-center text-white shrink-0"
              style={{ backgroundColor: walletColor }}
            >
              {WalletIconComponent && <WalletIconComponent className="w-7 h-7" />}
            </div>
            <div>
              <p className="text-sm font-medium text-text-secondary">
                Dompet
              </p>
              <p className="text-xs text-text-secondary">
                {wallet?.name || "Dompet"}
              </p>
            </div>
          </div>

          {/* Balance */}
          <div className="text-right">
            <p className="text-xs text-text-secondary mb-1">Saldo Saat Ini</p>
            <p className="text-2xl font-bold font-mono text-text-primary">
              {formatIDR(currentBalance)}
            </p>
          </div>
        </div>
      </div>

      {/* Transaction Stats Grid - using InfoCard like TransactionsStats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Income */}
        <InfoCard
          title="Total Pemasukan"
          value={formatIDR(totalIncome)}
          variant="income"
          description="Pemasukan di dompet ini"
          isLoading={isLoading}
        />

        {/* Total Expense */}
        <InfoCard
          title="Total Pengeluaran"
          value={formatIDR(totalExpense)}
          variant="expense"
          description="Pengeluaran di dompet ini"
          isLoading={isLoading}
        />

        {/* Net Flow */}
        <InfoCard
          title="Aliran Bersih"
          value={netFlow >= 0 ? `+${formatIDR(netFlow)}` : `-${formatIDR(Math.abs(netFlow))}`}
          variant={netFlow >= 0 ? "success" : "danger"}
          description={netFlow >= 0 ? "Surplus saldo dompet" : "Defisit saldo dompet"}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

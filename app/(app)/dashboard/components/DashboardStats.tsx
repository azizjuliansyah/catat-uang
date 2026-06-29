import { InfoCard } from "@/components/ui/molecules/InfoCard";

interface DashboardStatsProps {
  totalBalance: number;
  currentMonthIncome: number;
  currentMonthExpense: number;
  netCashflow: number;
  totalPaylaterDebt: number;
  isLoading?: boolean;
}

export function DashboardStats({
  totalBalance,
  currentMonthIncome,
  currentMonthExpense,
  netCashflow,
  totalPaylaterDebt,
  isLoading = false,
}: DashboardStatsProps) {
  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 font-sans">
      {/* Total Balance */}
      <InfoCard
        title="Total Saldo"
        value={formatIDR(totalBalance)}
        variant="primary"
        description="Semua dompet aktif"
        isLoading={isLoading}
      />

      {/* Current Month Income */}
      <InfoCard
        title="Pemasukan Bulan Ini"
        value={formatIDR(currentMonthIncome)}
        variant="income"
        description="Bulan berjalan"
        isLoading={isLoading}
      />

      {/* Current Month Expense */}
      <InfoCard
        title="Pengeluaran Bulan Ini"
        value={formatIDR(currentMonthExpense)}
        variant="expense"
        description="Bulan berjalan"
        isLoading={isLoading}
      />

      {/* Net Flow */}
      <InfoCard
        title="Arus Bersih (Net)"
        value={formatIDR(netCashflow)}
        variant={netCashflow >= 0 ? "income" : "expense"}
        description={netCashflow >= 0 ? "Surplus bulan ini" : "Defisit bulan ini"}
        isLoading={isLoading}
      />

      {/* Paylater Debt */}
      <InfoCard
        title="Hutang Paylater"
        value={formatIDR(totalPaylaterDebt)}
        variant="expense"
        description="Total tagihan aktif"
        isLoading={isLoading}
      />
    </div>
  );
}

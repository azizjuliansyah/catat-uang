import { InfoCard } from "@/components/ui/molecules/InfoCard";

interface DashboardStatsProps {
  totalBalance: number;
  currentMonthIncome: number;
  currentMonthExpense: number;
  netCashflow: number;
  totalPaylaterDebt: number;
}

export function DashboardStats({
  totalBalance,
  currentMonthIncome,
  currentMonthExpense,
  netCashflow,
  totalPaylaterDebt
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
      />

      {/* Current Month Income */}
      <InfoCard
        title="Pemasukan Bulan Ini"
        value={formatIDR(currentMonthIncome)}
        variant="income"
        description="Bulan berjalan"
      />

      {/* Current Month Expense */}
      <InfoCard
        title="Pengeluaran Bulan Ini"
        value={formatIDR(currentMonthExpense)}
        variant="expense"
        description="Bulan berjalan"
      />

      {/* Net Flow */}
      <InfoCard
        title="Arus Bersih (Net)"
        value={formatIDR(netCashflow)}
        variant={netCashflow >= 0 ? "success" : "danger"}
        description={netCashflow >= 0 ? "Surplus bulan ini" : "Defisit bulan ini"}
      />

      {/* Paylater Debt */}
      <InfoCard
        title="Hutang Paylater"
        value={formatIDR(totalPaylaterDebt)}
        variant="danger"
        description="Total tagihan aktif"
      />
    </div>
  );
}

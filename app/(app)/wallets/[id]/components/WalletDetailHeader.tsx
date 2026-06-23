import { formatIDR } from "@/lib/utils/format";
import { getIconComponent } from "@/lib/utils/icons";

interface Wallet {
  id: string;
  name: string;
  color: string;
  icon: string;
  balance: number;
  is_default: boolean;
}

interface WalletDetailHeaderProps {
  wallet: Wallet;
}

export function WalletDetailHeader({ wallet }: WalletDetailHeaderProps) {
  const WalletIconComponent = getIconComponent(wallet.icon);

  return (
    <div className="bg-gradient-to-br from-surface-card to-surface/20 border border-border rounded-3xl p-6 relative overflow-hidden">
      <div
        className="absolute top-0 left-0 right-0 h-1.5 rounded-t-3xl"
        style={{ backgroundColor: wallet.color }}
      />
      <div
        className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ backgroundColor: wallet.color }}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0"
            style={{ backgroundColor: wallet.color }}
          >
            <WalletIconComponent className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              {wallet.name}
            </h1>
            {wallet.is_default && (
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full mt-1">
                Utama
              </span>
            )}
          </div>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider">
            Saldo Saat Ini
          </p>
          <p className="text-3xl font-extrabold text-text-primary tracking-tight font-mono mt-1">
            {formatIDR(wallet.balance)}
          </p>
        </div>
      </div>
    </div>
  );
}

import { formatIDR } from "@/lib/utils/format";
import { getIconComponent } from "@/lib/utils/icons";
import { WalletItem } from "../../types";

interface WalletDetailCardProps {
  wallet: WalletItem | null;
  isLoading?: boolean;
}

export function WalletDetailCard({
  wallet,
  isLoading = false
}: WalletDetailCardProps) {
  const isWalletLoading = isLoading || !wallet;

  return (
    <>
      <div className="bg-gradient-to-br from-surface-card to-surface/20 border border-border rounded-3xl p-6 relative overflow-hidden">
        {!isWalletLoading && wallet && (
          <>
            <div
              className="absolute top-0 left-0 right-0 h-1.5 rounded-t-3xl"
              style={{ backgroundColor: wallet.color }}
            />
            <div
              className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full blur-3xl opacity-10 pointer-events-none"
              style={{ backgroundColor: wallet.color }}
            />
          </>
        )}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
          <div className="flex items-center gap-4">
            {isWalletLoading ? (
              <div className="w-14 h-14 rounded-2xl bg-border/40 shrink-0 animate-pulse" />
            ) : (
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0"
                style={{ backgroundColor: wallet.color }}
              >
                {(() => {
                  const WalletIconComponent = getIconComponent(wallet.icon);
                  return <WalletIconComponent className="w-7 h-7" />;
                })()}
              </div>
            )}
            <div className="space-y-2">
              {isWalletLoading ? (
                <div className="h-6 w-32 bg-border/40 rounded animate-pulse" />
              ) : (
                <h1 className="text-2xl font-bold text-text-primary tracking-tight">
                  {wallet.name}
                </h1>
              )}
              {!isWalletLoading && (wallet.is_default || wallet.is_archived) && (
                <div className="flex gap-1.5">
                  {wallet.is_default && (
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full mt-1">
                      Utama
                    </span>
                  )}
                  {wallet.is_archived && (
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-text-secondary bg-surface-hover px-2 py-0.5 rounded-full mt-1">
                      Diarsipkan
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="text-left sm:text-right space-y-1.5">
            <p className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider">
              Saldo Saat Ini
            </p>
            {isWalletLoading ? (
              <div className="h-8 w-36 bg-border/40 rounded animate-pulse" />
            ) : (
              <p className="text-3xl font-extrabold text-text-primary tracking-tight font-mono mt-1">
                {formatIDR(wallet.balance)}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

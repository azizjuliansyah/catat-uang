export function WalletSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map((n) => (
        <div key={n} className="p-[1.5px] rounded-2xl bg-border/30 w-full h-44 animate-pulse">
          <div className="bg-surface-card rounded-[15px] w-full h-full p-5 flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-surface-hover shrink-0" />
                <div className="space-y-1.5">
                  <div className="h-4 w-24 bg-surface-hover rounded" />
                  <div className="h-3 w-12 bg-surface-hover rounded" />
                </div>
              </div>
              <div className="flex gap-0.5 shrink-0">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="w-7 h-7 rounded-lg bg-surface-hover" />
                ))}
              </div>
            </div>
            <div className="pt-2.5 border-t border-border/50 space-y-1.5">
              <div className="h-3 w-16 bg-surface-hover rounded" />
              <div className="h-5 w-32 bg-surface-hover rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

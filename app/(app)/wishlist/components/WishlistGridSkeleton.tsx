import { ItemCardSkeleton } from "@/components/ui/skeleton";
import { GRID_PATTERNS } from "@/components/ui/skeleton/layouts/grid-config";

export function WishlistGridSkeleton() {
  return (
    <div className={GRID_PATTERNS.cards.triple}>
      {Array.from({ length: 6 }).map((_, i) => (
        <ItemCardSkeleton
          key={i}
          showIcon={true}
          showBadge={true}
          showTwoColumnAmounts={true}
          showProgress={false}
          showFooter={true}
          cardColor="#a855f7"
        />
      ))}
    </div>
  );
}

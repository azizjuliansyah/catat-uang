/**
 * PayLater Detail Header Component
 * Displays platform information and navigation
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PaylaterPlatform, PaylaterBillingDates } from "../types";
import { getIconComponent } from "@/lib/utils/icons";
import { ArrowLeft, Edit2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/atoms/Button";

interface PaylaterDetailHeaderProps {
  platform: PaylaterPlatform;
  nextBillingDates: PaylaterBillingDates;
}

export function PaylaterDetailHeader({ platform, nextBillingDates }: PaylaterDetailHeaderProps) {
  const router = useRouter();
  const IconComponent = getIconComponent(platform.icon);

  return (
    <>
      {/* Navigation and Top Toolbar */}
      <div className="flex flex-row justify-between">
        <Link
          href="/paylater"
          className="inline-flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Link>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/paylater")}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-xs cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit Platform
          </Button>
        </div>
      </div>

      {/* Platform Identity Card */}
      <div className="bg-surface-card border border-border rounded-2xl p-5 flex items-center justify-between gap-4 relative overflow-hidden">
        <div
          className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
          style={{ backgroundColor: platform.color }}
        />
        <div className="flex items-center gap-4 mt-1">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md shrink-0"
            style={{ backgroundColor: platform.color }}
          >
            <IconComponent className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary tracking-tight">{platform.name}</h1>
            {platform.is_archived && (
              <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-surface-hover text-text-secondary border border-border rounded-md mt-0.5 uppercase tracking-wider">
                Diarsipkan
              </span>
            )}
          </div>
        </div>
        <div className="text-right shrink-0 mt-1">
          <p className="text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">Siklus Tagihan</p>
          <p className="text-sm font-bold text-text-primary mt-1">Tgl {platform.billing_cycle_date}</p>
          <p className="text-[10px] text-text-secondary mt-0.5">+{platform.due_date_offset} hari jatuh tempo</p>
        </div>
      </div>
    </>
  );
}

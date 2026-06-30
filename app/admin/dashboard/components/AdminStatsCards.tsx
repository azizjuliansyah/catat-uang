"use client";

import { InfoCard } from "@/components/ui/molecules/InfoCard";
import Link from "next/link";
import { useRouter } from "next/navigation";

export interface AdminStatsData {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  totalAdmins: number;
}

interface AdminStatsCardsProps {
  stats: AdminStatsData;
  loading?: boolean;
}

export function AdminStatsCards({ stats, loading }: AdminStatsCardsProps) {
  const router = useRouter();

  const cards = [
    {
      title: "Total Pengguna",
      value: stats.totalUsers,
      variant: "warning" as const,
      href: "/admin/users",
    },
    {
      title: "Pengguna Aktif",
      value: stats.activeUsers,
      variant: "success" as const,
      href: "/admin/users?status=active",
    },
    {
      title: "Ditangguhkan",
      value: stats.suspendedUsers,
      variant: "danger" as const,
      href: "/admin/users?status=suspended",
    },
    {
      title: "Total Admin",
      value: stats.totalAdmins,
      variant: "primary" as const,
      href: "/admin/users?role=admin",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <InfoCard
          key={card.title}
          title={card.title}
          value={card.value.toLocaleString("id-ID")}
          variant={card.variant}
          isLoading={loading}
          onClick={() => router.push(card.href)}
          className="hover:border-border-strong transition-all"
        />
      ))}
    </div>
  );
}

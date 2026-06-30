"use client";

import { useState, useEffect } from "react";
import { getAdminStats, type AdminStatsData } from "../actions";

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStatsData>({
    totalUsers: 0,
    activeUsers: 0,
    suspendedUsers: 0,
    totalAdmins: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await getAdminStats();
        setStats(data);
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return { stats, loading };
}

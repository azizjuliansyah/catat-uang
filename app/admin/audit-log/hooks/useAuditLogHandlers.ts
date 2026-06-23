import { getAuditLogs } from "../actions";
import { getAdminUsers } from "@/app/admin/users/actions";
import type { AuditLog, AdminUser } from "./useAuditLogState";

interface UseAuditLogHandlersProps {
  setLogs: (logs: AuditLog[]) => void;
  setLoading: (loading: boolean) => void;
  setAdminUsers: (users: AdminUser[]) => void;
}

export function useAuditLogHandlers({
  setLogs,
  setLoading,
  setAdminUsers,
}: UseAuditLogHandlersProps) {
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await getAuditLogs();
      setLogs((data as unknown as AuditLog[]) || []);
    } catch (err: unknown) {
      console.error("Error fetching audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminUsers = async () => {
    try {
      const data = await getAdminUsers();
      setAdminUsers((data as unknown as AdminUser[]) || []);
    } catch (err: unknown) {
      console.error("Error fetching admin users:", err);
    }
  };

  const fetchAll = async () => {
    await Promise.all([fetchLogs(), fetchAdminUsers()]);
  };

  return {
    fetchLogs,
    fetchAdminUsers,
    fetchAll,
  };
}

import { getUsers, toggleSuspendUser, deleteUser, resetPassword } from "../actions";
import type { User } from "../types";

interface UseUsersHandlersProps {
  setUsers: (users: User[]) => void;
  setLoading: (loading: boolean) => void;
  setActionLoading: (loading: boolean) => void;
  closeAllModals: () => void;
  setGeneratedPassword: (password: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
}

export function useUsersHandlers({
  setUsers,
  setLoading,
  setActionLoading,
  closeAllModals,
  setGeneratedPassword,
  success,
  error,
}: UseUsersHandlersProps) {
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers((data as unknown as User[]) || []);
    } catch (err: unknown) {
      console.error("Error fetching users:", err);
      error("Gagal memuat data pengguna");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSuspend = async (selectedUser: User | null) => {
    if (!selectedUser) return;

    try {
      setActionLoading(true);
      const newStatus = await toggleSuspendUser(selectedUser.id, selectedUser.status, selectedUser.email);

      success(
        newStatus === "suspended"
          ? `Pengguna ${selectedUser.email} berhasil ditangguhkan`
          : `Pengguna ${selectedUser.email} berhasil diaktifkan kembali`
      );

      closeAllModals();
      await fetchUsers();
    } catch (err: unknown) {
      console.error("Error toggling suspend:", err);
      const msg = err instanceof Error ? err.message : String(err);
      error("Gagal mengubah status pengguna: " + msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (selectedUser: User | null) => {
    if (!selectedUser) return;

    try {
      setActionLoading(true);
      await deleteUser(selectedUser.id, selectedUser.email);

      success(`Pengguna ${selectedUser.email} berhasil dihapus permanently`);
      closeAllModals();
      await fetchUsers();
    } catch (err: unknown) {
      console.error("Error deleting user:", err);
      const msg = err instanceof Error ? err.message : String(err);
      error("Gagal menghapus pengguna: " + msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async (selectedUser: User | null, newPassword?: string) => {
    if (!selectedUser) return;

    try {
      setActionLoading(true);
      const tempPassword = await resetPassword(selectedUser.id, selectedUser.email, newPassword);

      // Store the generated password for display in modal
      setGeneratedPassword(tempPassword);

      success(`Password reset berhasil untuk ${selectedUser.email}.`);
    } catch (err: unknown) {
      console.error("Error resetting password:", err);
      const msg = err instanceof Error ? err.message : String(err);
      error("Gagal mereset password: " + msg);
    } finally {
      setActionLoading(false);
    }
  };

  return {
    fetchUsers,
    handleToggleSuspend,
    handleDeleteUser,
    handleResetPassword,
  };
}

// Export User type for use in other files
export type { User };

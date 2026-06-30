import { Button } from "@/components/ui/atoms/Button";
import { UserCheck, UserX, RefreshCw, Trash2, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { User } from "../types";

interface UserActionsCellProps {
  user: User;
  onActionClick: (user: User, actionType: "suspend" | "delete" | "reset") => void;
}

export function UserActionsCell({ user, onActionClick }: UserActionsCellProps) {
  return (
    <div className="flex items-center justify-center gap-1">
      <Button
        variant="ghost"
        onClick={() => onActionClick(user, "suspend")}
        className={`p-1.5 min-h-0 h-auto rounded-lg transition-colors ${
          user.status === "active"
            ? "text-text-secondary hover:text-warning hover:bg-warning/10"
            : "text-text-secondary hover:text-success hover:bg-success/10"
        }`}
        title={user.status === "active" ? "Tangguhkan" : "Aktifkan"}
      >
        {user.status === "active" ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
      </Button>

      <Button
        variant="ghost"
        onClick={() => onActionClick(user, "reset")}
        className="p-1.5 min-h-0 h-auto text-text-secondary hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
        title="Reset Password"
      >
        <RefreshCw className="w-4 h-4" />
      </Button>

      <Button
        variant="ghost"
        onClick={() => onActionClick(user, "delete")}
        className="p-1.5 min-h-0 h-auto text-text-secondary hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
        title="Hapus Pengguna"
      >
        <Trash2 className="w-4 h-4" />
      </Button>

      <Link
        href={`/admin/users/${user.id}`}
        className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors"
        title="Detail"
      >
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

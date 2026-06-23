import React from "react";
import { User, Check, AlertCircle, FileText, Shield } from "lucide-react";

export const iconMap = {
  User,
  Check,
  AlertCircle,
  FileText,
  Shield,
};

export const formatActionLabel = (action: string): string => {
  const labels: Record<string, string> = {
    create_user: "Membuat Pengguna",
    suspend_user: "Menangguhkan Pengguna",
    unsuspend_user: "Mengaktifkan Pengguna",
    delete_user: "Menghapus Pengguna",
    reset_password: "Reset Password"
  };
  return labels[action] || action;
};

export const getActionIconName = (action: string): keyof typeof iconMap => {
  switch (action) {
    case "create_user":
      return "User";
    case "suspend_user":
      return "Shield";
    case "unsuspend_user":
      return "Check";
    case "delete_user":
      return "AlertCircle";
    case "reset_password":
      return "FileText";
    default:
      return "FileText";
  }
};

export const getActionColor = (action: string): string => {
  switch (action) {
    case "create_user":
      return "bg-success/10 text-success";
    case "suspend_user":
      return "bg-warning/10 text-warning";
    case "unsuspend_user":
      return "bg-success/10 text-success";
    case "delete_user":
      return "bg-danger/10 text-danger";
    case "reset_password":
      return "bg-primary/10 text-primary";
    default:
      return "bg-surface-input text-text-secondary";
  }
};

export const getActionIcon = (action: string): React.ReactNode => {
  const iconName = getActionIconName(action);
  const IconComponent = iconMap[iconName] || FileText;

  const colorClass = action === "create_user"
    ? "text-success"
    : action === "suspend_user"
      ? "text-warning"
      : action === "unsuspend_user"
        ? "text-success"
        : action === "delete_user"
          ? "text-danger"
          : action === "reset_password"
            ? "text-primary"
            : "text-text-secondary";

  return <IconComponent className={`w-4 h-4 ${colorClass}`} />;
};

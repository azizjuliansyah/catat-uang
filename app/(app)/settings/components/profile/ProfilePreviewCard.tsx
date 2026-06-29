"use client";

import { formatDateIndo } from "@/lib/utils/date";

// Helper to get initials from name
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

interface ProfilePreviewCardProps {
  avatarUrl: string | null;
  name: string;
  email: string | null;
  createdAt: string | null;
}

export function ProfilePreviewCard({
  avatarUrl,
  name,
  email,
  createdAt,
}: ProfilePreviewCardProps) {
  const memberSince = createdAt
    ? formatDateIndo(new Date(createdAt), { month: "long", year: "numeric" })
    : null;

  return (
    <div className="bg-surface-card border border-border rounded-2xl p-6 space-y-4">
      {/* Avatar */}
      <div className="flex justify-center">
        <div className="relative">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="w-24 h-24 rounded-full object-cover border-4 border-surface"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center border-4 border-surface">
              <span className="text-3xl font-bold text-white font-display">
                {getInitials(name || "Pengguna")}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Name */}
      <div className="text-center">
        <h3 className="text-lg font-bold text-text-primary font-display">
          {name || "Pengguna"}
        </h3>
      </div>

      {/* Email */}
      <div className="text-center">
        <p className="text-sm text-text-secondary font-mono">
          {email || "email@contoh.com"}
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-border/40" />

      {/* Member Since */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-text-muted">Member sejak</span>
        <span className="text-text-secondary">{memberSince || "-"}</span>
      </div>

      {/* Account Status */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-text-muted">Status</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-text-success font-medium">Aktif</span>
        </span>
      </div>
    </div>
  );
}

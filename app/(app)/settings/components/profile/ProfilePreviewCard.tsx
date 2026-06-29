"use client";

import { User } from "lucide-react";
import { formatDateIndo } from "@/lib/utils/date";

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
            <div className="w-24 h-24 rounded-full bg-surface-hover flex items-center justify-center border-4 border-surface">
              <User className="w-12 h-12 text-text-muted" />
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

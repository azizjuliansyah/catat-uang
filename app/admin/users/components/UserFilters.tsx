import { Search } from "lucide-react";

interface UserFiltersProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  statusFilter: "all" | "active" | "suspended";
  setStatusFilter: (val: "all" | "active" | "suspended") => void;
  roleFilter: "all" | "admin" | "user";
  setRoleFilter: (val: "all" | "admin" | "user") => void;
}

export function UserFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  roleFilter,
  setRoleFilter
}: UserFiltersProps) {
  return (
    <div className="bg-surface-card border border-border rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 font-sans">
      {/* Search */}
      <div className="relative flex-1 sm:max-w-xs">
        <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Cari email atau nama..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 bg-surface-input border border-border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none rounded-xl text-xs text-text-primary transition-all focus-glow h-10"
        />
      </div>

      {/* Status & Role Filters */}
      <div className="flex flex-col sm:flex-row items-stretch gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "suspended")}
          className="px-3 bg-surface-input border border-border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none rounded-xl text-xs text-text-primary cursor-pointer focus-glow h-10"
        >
          <option value="all">Semua Status</option>
          <option value="active">Aktif</option>
          <option value="suspended">Ditangguhkan</option>
        </select>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as "all" | "admin" | "user")}
          className="px-3 bg-surface-input border border-border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none rounded-xl text-xs text-text-primary cursor-pointer focus-glow h-10"
        >
          <option value="all">Semua Peran</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
      </div>
    </div>
  );
}

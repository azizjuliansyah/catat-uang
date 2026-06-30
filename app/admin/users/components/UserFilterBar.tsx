import { SearchInput } from "@/components/ui/atoms/SearchInput";
import CustomSelect from "@/components/ui/atoms/CustomSelect";

interface UserFilterBarProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  statusFilter: "all" | "active" | "suspended";
  setStatusFilter: (val: "all" | "active" | "suspended") => void;
  roleFilter: "all" | "admin" | "user";
  setRoleFilter: (val: "all" | "admin" | "user") => void;
}

const statusOptions = [
  { value: "all", label: "Semua Status" },
  { value: "active", label: "Aktif" },
  { value: "suspended", label: "Ditangguhkan" },
];

const roleOptions = [
  { value: "all", label: "Semua Peran" },
  { value: "admin", label: "Admin" },
  { value: "user", label: "User" },
];

export function UserFilterBar({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  roleFilter,
  setRoleFilter
}: UserFilterBarProps) {
  return (
    <div className="bg-surface-card border border-border rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">

      {/* Search Box */}
      <SearchInput
        placeholder="Cari email atau nama..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        showClearButton={!!searchTerm}
        onClear={() => setSearchTerm("")}
      />

      {/* Status & Role Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
        <div className="w-full sm:w-36">
          <CustomSelect
            options={statusOptions}
            value={statusFilter}
            onChange={(val) => setStatusFilter((val || "all") as "all" | "active" | "suspended")}
            placeholder="Semua Status"
            size="sm"
          />
        </div>

        <div className="w-full sm:w-36">
          <CustomSelect
            options={roleOptions}
            value={roleFilter}
            onChange={(val) => setRoleFilter((val || "all") as "all" | "admin" | "user")}
            placeholder="Semua Peran"
            size="sm"
          />
        </div>
      </div>
    </div>
  );
}

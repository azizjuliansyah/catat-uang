export interface UserDetails {
  id: string;
  email: string;
  name: string | null;
  role: "admin" | "user";
  status: "active" | "suspended";
  created_at: string;
  updated_at: string;
  avatar_url?: string | null;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  action: string;
  details: Record<string, unknown>;
  created_at: string;
  users?: {
    email: string;
  } | null;
}

export interface ModalUserCompat {
  id: string;
  email: string;
  name: string | null;
  role: "admin" | "user";
  status: "active" | "suspended";
  created_at: string;
}

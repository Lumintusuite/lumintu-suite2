export type UserRole = "admin" | "member";

export interface Profile {
  id: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  profile: Profile;
}

export type AuthActionState = {
  error?: string;
  success?: string;
};

export const ADMIN_PATH = "/admin";
export const MEMBER_PATH = "/member";

export function getDashboardPath(role: UserRole): string {
  return role === "admin" ? ADMIN_PATH : MEMBER_PATH;
}

export const AUTH_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
] as const;

export const PUBLIC_PATHS = ["/", ...AUTH_PATHS] as const;

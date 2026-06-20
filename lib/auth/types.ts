import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
  }
}

export type UserRole = "admin" | "member";

export interface Profile {
  id: string;
  fullName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
  profile?: Profile | null;
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

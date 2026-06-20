import type { UserRole } from "./types";
import { requireAdmin, requireAuthenticated, requireMember } from "./session";

export async function canAccessAdmin(): Promise<boolean> {
  const result = await requireAdmin();
  return !("error" in result);
}

export async function canAccessMember(): Promise<boolean> {
  const result = await requireMember();
  return !("error" in result);
}

export async function canManageProducts(): Promise<boolean> {
  return await canAccessAdmin();
}

export async function canManageOrders(): Promise<boolean> {
  return await canAccessAdmin();
}

export async function canManagePayments(): Promise<boolean> {
  return await canAccessAdmin();
}

export async function canManageLicenses(): Promise<boolean> {
  return await canAccessAdmin();
}

export async function canManageAffiliates(): Promise<boolean> {
  return await canAccessAdmin();
}

export async function canManageUsers(): Promise<boolean> {
  return await canAccessAdmin();
}

export async function canViewOwnData(userId: string): Promise<boolean> {
  const result = await requireAuthenticated();
  if ("error" in result) return false;
  return result.user.id === userId;
}

export async function canAccessAffiliateDashboard(): Promise<boolean> {
  const result = await requireAuthenticated();
  if ("error" in result) return false;
  return result.user.role === "member" || result.user.role === "admin";
}

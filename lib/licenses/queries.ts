import { getCurrentUser } from "@/lib/auth/get-user";
import type { AuthUser } from "@/lib/auth/types";
import {
  DEFAULT_PAGE_SIZE,
  type PaginatedResult,
} from "@/lib/catalog/types";
import { createClient } from "@/lib/supabase/server";
import type { License, LicenseActivation } from "@/lib/supabase/types";

export async function requireAuthenticated(): Promise<
  { user: AuthUser } | { error: string }
> {
  const user = await getCurrentUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  return { user };
}

export async function requireAdmin(): Promise<
  { user: AuthUser } | { error: string }
> {
  const user = await getCurrentUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  if (user.profile.role !== "admin") {
    return { error: "Admin access required." };
  }

  return { user };
}

type ListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
};

function getPaginationRange(page: number, pageSize: number) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return { from, to };
}

export async function listLicenses({
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  search = "",
}: ListParams = {}): Promise<PaginatedResult<License>> {
  const supabase = await createClient();
  const { from, to } = getPaginationRange(page, pageSize);

  let query = supabase
    .from("licenses")
    .select("*, products(id, name, slug), profiles(id, full_name, email)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (search.trim()) {
    const term = `%${search.trim()}%`;
    query = query.or(`license_key.ilike.${term}`);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const total = count ?? 0;

  return {
    items: (data ?? []) as License[],
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function listUserLicenses(
  userId: string,
  { page = 1, pageSize = DEFAULT_PAGE_SIZE }: Omit<ListParams, "search"> = {}
): Promise<PaginatedResult<License>> {
  const supabase = await createClient();
  const { from, to } = getPaginationRange(page, pageSize);

  const { data, error, count } = await supabase
    .from("licenses")
    .select("*, products(id, name, slug)", { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const total = count ?? 0;

  return {
    items: (data ?? []) as License[],
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getLicenseById(
  id: string
): Promise<License | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("licenses")
    .select("*, products(id, name, slug), profiles(id, full_name, email)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as License | null) ?? null;
}

export async function getLicenseByKey(
  licenseKey: string
): Promise<License | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("licenses")
    .select("*, products(id, name, slug), profiles(id, full_name, email)")
    .eq("license_key", licenseKey)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as License | null) ?? null;
}

export async function getLicenseActivations(
  licenseId: string
): Promise<LicenseActivation[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("license_activations")
    .select("*")
    .eq("license_id", licenseId)
    .order("activated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as LicenseActivation[];
}

export async function getLicenseStats(): Promise<{
  totalLicenses: number;
  activeLicenses: number;
  expiredLicenses: number;
  suspendedLicenses: number;
}> {
  const supabase = await createClient();

  const [total, active, expired, suspended] = await Promise.all([
    supabase.from("licenses").select("*", { count: "exact", head: true }),
    supabase
      .from("licenses")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("licenses")
      .select("*", { count: "exact", head: true })
      .eq("status", "expired"),
    supabase
      .from("licenses")
      .select("*", { count: "exact", head: true })
      .eq("status", "suspended"),
  ]);

  return {
    totalLicenses: total.count ?? 0,
    activeLicenses: active.count ?? 0,
    expiredLicenses: expired.count ?? 0,
    suspendedLicenses: suspended.count ?? 0,
  };
}

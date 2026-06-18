import { getCurrentUser } from "@/lib/auth/get-user";
import type { AuthUser } from "@/lib/auth/types";
import {
  DEFAULT_PAGE_SIZE,
  type PaginatedResult,
} from "@/lib/catalog/types";
import { createClient } from "@/lib/supabase/server";
import type { Affiliate, Referral, ReferralClick, AffiliateNotification } from "@/lib/supabase/types";

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

export async function listAffiliates({
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  search = "",
}: ListParams = {}): Promise<PaginatedResult<Affiliate>> {
  const supabase = await createClient();
  const { from, to } = getPaginationRange(page, pageSize);

  let query = supabase
    .from("affiliates")
    .select("*, profiles(id, full_name, email)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (search.trim()) {
    const term = `%${search.trim()}%`;
    query = query.or(`affiliate_code.ilike.${term}`);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const total = count ?? 0;

  return {
    items: (data ?? []) as Affiliate[],
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getAffiliateByUserId(
  userId: string
): Promise<Affiliate | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("affiliates")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as Affiliate | null) ?? null;
}

export async function getAffiliateByCode(
  affiliateCode: string
): Promise<Affiliate | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("affiliates")
    .select("*")
    .eq("affiliate_code", affiliateCode)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as Affiliate | null) ?? null;
}

export async function getAffiliateById(
  id: string
): Promise<Affiliate | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("affiliates")
    .select("*, profiles(id, full_name, email)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as Affiliate | null) ?? null;
}

export async function listReferrals({
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  affiliateId,
}: ListParams & { affiliateId?: string } = {}): Promise<PaginatedResult<Referral>> {
  const supabase = await createClient();
  const { from, to } = getPaginationRange(page, pageSize);

  let query = supabase
    .from("referrals")
    .select("*, affiliates!inner(user_id), orders!inner(total, created_at)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (affiliateId) {
    query = query.eq("affiliate_id", affiliateId);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const total = count ?? 0;

  return {
    items: (data ?? []) as Referral[],
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getReferralStats(affiliateId: string): Promise<{
  totalClicks: number;
  totalReferrals: number;
  totalCommission: number;
  pendingCommission: number;
  approvedCommission: number;
}> {
  const supabase = await createClient();

  const [clicks, referrals] = await Promise.all([
    supabase
      .from("referral_clicks")
      .select("*", { count: "exact", head: true })
      .eq("affiliate_id", affiliateId),
    supabase
      .from("referrals")
      .select("commission_amount, status")
      .eq("affiliate_id", affiliateId),
  ]);

  const totalClicks = clicks.count ?? 0;
  const totalReferrals = referrals.data?.length ?? 0;

  let totalCommission = 0;
  let pendingCommission = 0;
  let approvedCommission = 0;

  for (const referral of referrals.data ?? []) {
    totalCommission += referral.commission_amount;
    if (referral.status === "pending") {
      pendingCommission += referral.commission_amount;
    } else if (referral.status === "approved") {
      approvedCommission += referral.commission_amount;
    }
  }

  return {
    totalClicks,
    totalReferrals,
    totalCommission,
    pendingCommission,
    approvedCommission,
  };
}

export async function listNotifications(
  affiliateId: string,
  { page = 1, pageSize = DEFAULT_PAGE_SIZE }: Omit<ListParams, "search"> = {}
): Promise<PaginatedResult<AffiliateNotification>> {
  const supabase = await createClient();
  const { from, to } = getPaginationRange(page, pageSize);

  const { data, error, count } = await supabase
    .from("affiliate_notifications")
    .select("*", { count: "exact" })
    .eq("affiliate_id", affiliateId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const total = count ?? 0;

  return {
    items: (data ?? []) as AffiliateNotification[],
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function markNotificationAsRead(
  notificationId: string
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("affiliate_notifications")
    .update({ is_read: true })
    .eq("id", notificationId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getAffiliateStats(): Promise<{
  totalAffiliates: number;
  activeAffiliates: number;
  pendingAffiliates: number;
  totalCommission: number;
}> {
  const supabase = await createClient();

  const [total, active, pending, commission] = await Promise.all([
    supabase.from("affiliates").select("*", { count: "exact", head: true }),
    supabase
      .from("affiliates")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved"),
    supabase
      .from("affiliates")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("referrals")
      .select("commission_amount")
      .eq("status", "approved"),
  ]);

  const totalCommission = (commission.data ?? []).reduce(
    (sum, r) => sum + r.commission_amount,
    0
  );

  return {
    totalAffiliates: total.count ?? 0,
    activeAffiliates: active.count ?? 0,
    pendingAffiliates: pending.count ?? 0,
    totalCommission,
  };
}

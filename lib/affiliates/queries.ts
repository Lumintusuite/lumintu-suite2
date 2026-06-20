import { getCurrentUser } from "@/lib/auth/session";
import type { AuthUser } from "@/lib/auth/types";
import {
  DEFAULT_PAGE_SIZE,
  type PaginatedResult,
} from "@/lib/catalog/types";
import { affiliateRepository } from "@/lib/db/affiliate-repository";
import { AffiliateStatus, ReferralStatus } from "@prisma/client";

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

  if (user.role !== "admin") {
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
}: ListParams = {}): Promise<PaginatedResult<any>> {
  const { from, to } = getPaginationRange(page, pageSize);

  let affiliates = await affiliateRepository.getAllAffiliates();

  if (search.trim()) {
    affiliates = await affiliateRepository.getAllAffiliates({ search: search.trim() });
  }

  const total = affiliates.length;
  const items = affiliates.slice(from, to + 1);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getAffiliateByUserId(
  userId: string
): Promise<any | null> {
  return affiliateRepository.getAffiliateByUserId(userId);
}

export async function getAffiliateByCode(
  affiliateCode: string
): Promise<any | null> {
  return affiliateRepository.getAffiliateByCode(affiliateCode);
}

export async function getAffiliateById(
  id: string
): Promise<any | null> {
  return affiliateRepository.getAffiliateById(id);
}

export async function listReferrals({
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  affiliateId,
}: ListParams & { affiliateId?: string } = {}): Promise<PaginatedResult<any>> {
  const { from, to } = getPaginationRange(page, pageSize);

  let referrals = await affiliateRepository.getAllReferrals();

  if (affiliateId) {
    referrals = referrals.filter(r => r.affiliateId === affiliateId);
  }

  const total = referrals.length;
  const items = referrals.slice(from, to + 1);

  return {
    items,
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
  const [clicks, referrals] = await Promise.all([
    affiliateRepository.getReferralClicksCount(affiliateId),
    affiliateRepository.getAllReferrals({ affiliateId }),
  ]);

  const totalClicks = clicks;
  const totalReferrals = referrals.length;

  let totalCommission = 0;
  let pendingCommission = 0;
  let approvedCommission = 0;

  for (const referral of referrals) {
    totalCommission += Number(referral.commissionAmount);
    if (referral.status === ReferralStatus.pending) {
      pendingCommission += Number(referral.commissionAmount);
    } else if (referral.status === ReferralStatus.approved) {
      approvedCommission += Number(referral.commissionAmount);
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
): Promise<PaginatedResult<any>> {
  const { from, to } = getPaginationRange(page, pageSize);

  let notifications = await affiliateRepository.getNotificationsByAffiliateId(affiliateId);

  const total = notifications.length;
  const items = notifications.slice(from, to + 1);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function markNotificationAsRead(
  notificationId: string
): Promise<void> {
  await affiliateRepository.updateNotification(notificationId, { isRead: true });
}

export async function getAffiliateStats(): Promise<{
  totalAffiliates: number;
  activeAffiliates: number;
  pendingAffiliates: number;
  totalCommission: number;
}> {
  const [totalAffiliates, activeAffiliates, pendingAffiliates, approvedReferrals] = await Promise.all([
    affiliateRepository.getAffiliatesCount(),
    affiliateRepository.getAffiliatesCount({ status: AffiliateStatus.approved }),
    affiliateRepository.getAffiliatesCount({ status: AffiliateStatus.pending }),
    affiliateRepository.getAllReferrals({ status: ReferralStatus.approved }),
  ]);

  const totalCommission = approvedReferrals.reduce(
    (sum, r) => sum + Number(r.commissionAmount),
    0
  );

  return {
    totalAffiliates,
    activeAffiliates,
    pendingAffiliates,
    totalCommission,
  };
}

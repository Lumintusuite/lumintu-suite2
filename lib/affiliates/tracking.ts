import { cookies } from "next/headers";

import { affiliateRepository } from "@/lib/db/affiliate-repository";
import { getAffiliateByCode } from "@/lib/affiliates/queries";

const REFERRAL_COOKIE_NAME = "referral_code";
const REFERRAL_COOKIE_DURATION_DAYS = 30;

export async function setReferralCookie(affiliateCode: string): Promise<void> {
  const cookieStore = await cookies();
  const expires = new Date();
  expires.setDate(expires.getDate() + REFERRAL_COOKIE_DURATION_DAYS);

  cookieStore.set(REFERRAL_COOKIE_NAME, affiliateCode, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
}

export async function getReferralCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(REFERRAL_COOKIE_NAME)?.value || null;
}

export async function clearReferralCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(REFERRAL_COOKIE_NAME);
}

export async function trackReferralClick(
  affiliateCode: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ success: boolean; error?: string }> {
  const affiliate = await getAffiliateByCode(affiliateCode);

  if (!affiliate) {
    return { success: false, error: "Invalid affiliate code" };
  }

  if (affiliate.status !== "approved") {
    return { success: false, error: "Affiliate not approved" };
  }

  try {
    await affiliateRepository.addReferralClick({
      affiliateId: affiliate.id,
      ipAddress,
      userAgent,
    });
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to track referral click" };
  }

  // Set cookie for future tracking
  await setReferralCookie(affiliateCode);

  return { success: true };
}

export async function getReferralFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const affiliateCode = cookieStore.get(REFERRAL_COOKIE_NAME)?.value || null;

  if (!affiliateCode) {
    return null;
  }

  // Verify affiliate still exists and is approved
  const affiliate = await getAffiliateByCode(affiliateCode);

  if (!affiliate || affiliate.status !== "approved") {
    await clearReferralCookie();
    return null;
  }

  return affiliateCode;
}

export function generateReferralUrl(affiliateCode: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}?ref=${affiliateCode}`;
}

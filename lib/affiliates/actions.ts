"use server";

import { revalidatePath } from "next/cache";

import {
  createNotificationSchema,
  createReferralSchema,
  mapZodErrors,
  registerAffiliateSchema,
  updateAffiliateStatusSchema,
  updateCommissionRateSchema,
  updateReferralStatusSchema,
} from "@/lib/affiliates/schemas";
import type { AffiliateActionState } from "@/lib/affiliates/types";
import { requireAdmin, requireAuthenticated } from "@/lib/affiliates/queries";
import { affiliateRepository } from "@/lib/db/affiliate-repository";
import { sendAffiliateApprovedEmail, sendReferralSaleEmail } from "@/lib/emails/actions";
import { AffiliateStatus, ReferralStatus } from "@prisma/client";

const AFFILIATES_PATH = "/affiliate";
const ADMIN_AFFILIATES_PATH = "/admin/affiliates";
const ADMIN_REFERRALS_PATH = "/admin/referrals";

export async function registerAffiliate(
  _prevState: AffiliateActionState,
  formData: FormData
): Promise<AffiliateActionState> {
  const auth = await requireAuthenticated();

  if ("error" in auth) {
    return { error: auth.error };
  }

  const affiliateCode = formData.get("affiliateCode") as string;

  const parsed = registerAffiliateSchema.safeParse({ affiliateCode });

  if (!parsed.success) {
    return { fieldErrors: mapZodErrors(parsed.error) };
  }

  // Check if user already has an affiliate account
  const existingAffiliate = await affiliateRepository.getAffiliateByUserId(auth.user.id);

  if (existingAffiliate) {
    return { error: "You already have an affiliate account." };
  }

  // Check if affiliate code is unique
  const codeExists = await affiliateRepository.getAffiliateByCode(parsed.data.affiliateCode.toUpperCase());

  if (codeExists) {
    return { error: "This affiliate code is already taken." };
  }

  // Create affiliate
  try {
    await affiliateRepository.createAffiliate({
      userId: auth.user.id,
      affiliateCode: parsed.data.affiliateCode.toUpperCase(),
      status: AffiliateStatus.pending,
      commissionRate: 10.00,
    });
  } catch (error: any) {
    return { error: error.message || "Failed to register affiliate." };
  }

  revalidatePath(AFFILIATES_PATH);
  revalidatePath(ADMIN_AFFILIATES_PATH);
  return { success: "Affiliate registration submitted for approval." };
}

export async function approveAffiliate(
  id: string
): Promise<{ error?: string; success?: string }> {
  const auth = await requireAdmin();

  if ("error" in auth) {
    return { error: auth.error };
  }

  try {
    await affiliateRepository.updateAffiliate(id, {
      status: AffiliateStatus.approved,
    });
  } catch (error: any) {
    return { error: error.message || "Failed to approve affiliate." };
  }

  // Create notification and send email
  const affiliate = await affiliateRepository.getAffiliateById(id);

  if (affiliate) {
    await affiliateRepository.createNotification({
      affiliateId: affiliate.id,
      title: "Affiliate Approved",
      message: "Your affiliate account has been approved. You can now start earning commissions!",
    });

    // Get user info for email
    const user = await affiliateRepository.getUserById(affiliate.userId);

    if (user && user.profile) {
      await sendAffiliateApprovedEmail(
        affiliate.userId,
        user.email || "",
        user.profile.fullName || "Affiliate",
        affiliate.affiliateCode
      );
    }
  }

  revalidatePath(ADMIN_AFFILIATES_PATH);
  revalidatePath(AFFILIATES_PATH);
  return { success: "Affiliate approved." };
}

export async function rejectAffiliate(
  id: string
): Promise<{ error?: string; success?: string }> {
  const auth = await requireAdmin();

  if ("error" in auth) {
    return { error: auth.error };
  }

  try {
    await affiliateRepository.updateAffiliate(id, {
      status: AffiliateStatus.rejected,
    });
  } catch (error: any) {
    return { error: error.message || "Failed to reject affiliate." };
  }

  // Create notification
  const affiliate = await affiliateRepository.getAffiliateById(id);

  if (affiliate) {
    await affiliateRepository.createNotification({
      affiliateId: affiliate.id,
      title: "Affiliate Rejected",
      message: "Your affiliate application has been rejected. Please contact support for more information.",
    });
  }

  revalidatePath(ADMIN_AFFILIATES_PATH);
  revalidatePath(AFFILIATES_PATH);
  return { success: "Affiliate rejected." };
}

export async function updateAffiliateStatus(
  _prevState: AffiliateActionState,
  formData: FormData
): Promise<AffiliateActionState> {
  const auth = await requireAdmin();

  if ("error" in auth) {
    return { error: auth.error };
  }

  const id = formData.get("id") as string;
  const status = formData.get("status") as string;

  if (!id) {
    return { error: "Affiliate ID is required." };
  }

  const parsed = updateAffiliateStatusSchema.safeParse({ status });

  if (!parsed.success) {
    return { fieldErrors: mapZodErrors(parsed.error) };
  }

  try {
    await affiliateRepository.updateAffiliate(id, {
      status: parsed.data.status as AffiliateStatus,
    });
  } catch (error: any) {
    return { error: error.message || "Failed to update affiliate status." };
  }

  revalidatePath(ADMIN_AFFILIATES_PATH);
  return { success: "Affiliate status updated." };
}

export async function updateCommissionRate(
  _prevState: AffiliateActionState,
  formData: FormData
): Promise<AffiliateActionState> {
  const auth = await requireAdmin();

  if ("error" in auth) {
    return { error: auth.error };
  }

  const id = formData.get("id") as string;
  const commissionRate = formData.get("commissionRate") as string;

  if (!id) {
    return { error: "Affiliate ID is required." };
  }

  const parsed = updateCommissionRateSchema.safeParse({ commissionRate });

  if (!parsed.success) {
    return { fieldErrors: mapZodErrors(parsed.error) };
  }

  try {
    await affiliateRepository.updateAffiliate(id, {
      commissionRate: parsed.data.commissionRate,
    });
  } catch (error: any) {
    return { error: error.message || "Failed to update commission rate." };
  }

  revalidatePath(ADMIN_AFFILIATES_PATH);
  return { success: "Commission rate updated." };
}

export async function createReferral(
  affiliateId: string,
  orderId: string,
  commissionAmount: number
): Promise<{ error?: string; success?: string }> {
  // Check if referral already exists for this order
  const existingReferral = await affiliateRepository.getReferralByOrderId(orderId);

  if (existingReferral) {
    return { error: "Referral already exists for this order." };
  }

  try {
    await affiliateRepository.createReferral({
      affiliateId,
      orderId,
      commissionAmount,
      status: ReferralStatus.pending,
    });
  } catch (error: any) {
    return { error: error.message || "Failed to create referral." };
  }

  // Create notification and send email
  const affiliate = await affiliateRepository.getAffiliateById(affiliateId);

  if (affiliate) {
    await affiliateRepository.createNotification({
      affiliateId,
      title: "New Referral Sale",
      message: `You earned $${commissionAmount.toFixed(2)} commission from a new sale!`,
    });

    // Get user info for email
    const user = await affiliateRepository.getUserById(affiliate.userId);

    if (user && user.profile) {
      await sendReferralSaleEmail(
        affiliate.userId,
        user.email || "",
        user.profile.fullName || "Affiliate",
        commissionAmount
      );
    }
  }

  revalidatePath(AFFILIATES_PATH);
  revalidatePath(ADMIN_REFERRALS_PATH);
  return { success: "Referral created." };
}

export async function updateReferralStatus(
  _prevState: AffiliateActionState,
  formData: FormData
): Promise<AffiliateActionState> {
  const auth = await requireAdmin();

  if ("error" in auth) {
    return { error: auth.error };
  }

  const id = formData.get("id") as string;
  const status = formData.get("status") as string;

  if (!id) {
    return { error: "Referral ID is required." };
  }

  const parsed = updateReferralStatusSchema.safeParse({ status });

  if (!parsed.success) {
    return { fieldErrors: mapZodErrors(parsed.error) };
  }

  try {
    await affiliateRepository.updateReferral(id, {
      status: parsed.data.status as ReferralStatus,
    });
  } catch (error: any) {
    return { error: error.message || "Failed to update referral status." };
  }

  revalidatePath(ADMIN_REFERRALS_PATH);
  revalidatePath(AFFILIATES_PATH);
  return { success: "Referral status updated." };
}

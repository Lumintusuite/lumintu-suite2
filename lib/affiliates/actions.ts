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
import { createClient } from "@/lib/supabase/server";

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

  const supabase = await createClient();

  // Check if user already has an affiliate account
  const existingAffiliate = await supabase
    .from("affiliates")
    .select("id")
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (existingAffiliate.data) {
    return { error: "You already have an affiliate account." };
  }

  // Check if affiliate code is unique
  const codeExists = await supabase
    .from("affiliates")
    .select("id")
    .eq("affiliate_code", parsed.data.affiliateCode.toUpperCase())
    .maybeSingle();

  if (codeExists.data) {
    return { error: "This affiliate code is already taken." };
  }

  // Create affiliate
  const { data: affiliate, error } = await supabase
    .from("affiliates")
    .insert({
      user_id: auth.user.id,
      affiliate_code: parsed.data.affiliateCode.toUpperCase(),
      status: "pending",
      commission_rate: 10.00,
    })
    .select("id")
    .single();

  if (error || !affiliate) {
    return { error: error?.message ?? "Failed to register affiliate." };
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

  const supabase = await createClient();

  const { error } = await supabase
    .from("affiliates")
    .update({ status: "approved" })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  // Create notification
  const { data: affiliate } = await supabase
    .from("affiliates")
    .select("id")
    .eq("id", id)
    .single();

  if (affiliate) {
    await supabase.from("affiliate_notifications").insert({
      affiliate_id: affiliate.id,
      title: "Affiliate Approved",
      message: "Your affiliate account has been approved. You can now start earning commissions!",
    });
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

  const supabase = await createClient();

  const { error } = await supabase
    .from("affiliates")
    .update({ status: "rejected" })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  // Create notification
  const { data: affiliate } = await supabase
    .from("affiliates")
    .select("id")
    .eq("id", id)
    .single();

  if (affiliate) {
    await supabase.from("affiliate_notifications").insert({
      affiliate_id: affiliate.id,
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

  const supabase = await createClient();

  const { error } = await supabase
    .from("affiliates")
    .update({ status: parsed.data.status })
    .eq("id", id);

  if (error) {
    return { error: error.message };
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

  const supabase = await createClient();

  const { error } = await supabase
    .from("affiliates")
    .update({ commission_rate: parsed.data.commissionRate })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(ADMIN_AFFILIATES_PATH);
  return { success: "Commission rate updated." };
}

export async function createReferral(
  affiliateId: string,
  orderId: string,
  commissionAmount: number
): Promise<{ error?: string; success?: string }> {
  const supabase = await createClient();

  // Check if referral already exists for this order
  const existingReferral = await supabase
    .from("referrals")
    .select("id")
    .eq("order_id", orderId)
    .maybeSingle();

  if (existingReferral.data) {
    return { error: "Referral already exists for this order." };
  }

  const { error } = await supabase.from("referrals").insert({
    affiliate_id: affiliateId,
    order_id: orderId,
    commission_amount: commissionAmount,
    status: "pending",
  });

  if (error) {
    return { error: error.message };
  }

  // Create notification
  await supabase.from("affiliate_notifications").insert({
    affiliate_id: affiliateId,
    title: "New Referral Sale",
    message: `You earned $${commissionAmount.toFixed(2)} commission from a new sale!`,
  });

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

  const supabase = await createClient();

  const { error } = await supabase
    .from("referrals")
    .update({ status: parsed.data.status })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(ADMIN_REFERRALS_PATH);
  revalidatePath(AFFILIATES_PATH);
  return { success: "Referral status updated." };
}

"use server";

import { revalidatePath } from "next/cache";

import {
  createLicenseSchema,
  extendLicenseSchema,
  mapZodErrors,
  updateActivationLimitSchema,
  updateLicenseStatusSchema,
} from "@/lib/licenses/schemas";
import type { LicenseActionState } from "@/lib/licenses/types";
import { requireAdmin } from "@/lib/licenses/queries";
import {
  calculateExpirationDate,
  generateUniqueLicenseKey,
} from "@/lib/licenses/generator";
import { createClient } from "@/lib/supabase/server";
import { sendLicenseGeneratedEmail } from "@/lib/emails/actions";

const LICENSES_PATH = "/licenses";
const ADMIN_LICENSES_PATH = "/admin/licenses";

export async function createLicense(
  _prevState: LicenseActionState,
  formData: FormData
): Promise<LicenseActionState> {
  const auth = await requireAdmin();

  if ("error" in auth) {
    return { error: auth.error };
  }

  const parsed = createLicenseSchema.safeParse({
    userId: formData.get("userId"),
    productId: formData.get("productId"),
    orderId: formData.get("orderId") || undefined,
    maxActivations: formData.get("maxActivations") || "1",
    expiresAt: formData.get("expiresAt") || undefined,
  });

  if (!parsed.success) {
    return { fieldErrors: mapZodErrors(parsed.error) };
  }

  const supabase = await createClient();

  try {
    const licenseKey = await generateUniqueLicenseKey();

    const { data: license, error } = await supabase
      .from("licenses")
      .insert({
        user_id: parsed.data.userId,
        product_id: parsed.data.productId,
        order_id: parsed.data.orderId,
        license_key: licenseKey,
        status: "active",
        max_activations: parsed.data.maxActivations,
        expires_at: parsed.data.expiresAt || null,
      })
      .select("id")
      .single();

    if (error || !license) {
      return { error: error?.message ?? "Failed to create license." };
    }

    revalidatePath(LICENSES_PATH);
    revalidatePath(ADMIN_LICENSES_PATH);
    return { success: "License created successfully." };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to generate license key.",
    };
  }
}

export async function generateLicenseForOrder(
  orderId: string,
  userId: string,
  productId: string
): Promise<{ licenseId: string; licenseKey: string } | { error: string }> {
  const supabase = await createClient();

  try {
    const licenseKey = await generateUniqueLicenseKey();

    const { data: license, error } = await supabase
      .from("licenses")
      .insert({
        user_id: userId,
        product_id: productId,
        order_id: orderId,
        license_key: licenseKey,
        status: "active",
        max_activations: 1,
        expires_at: calculateExpirationDate(1),
      })
      .select("id")
      .single();

    if (error || !license) {
      return { error: error?.message ?? "Failed to generate license." };
    }

    // Get user and product info for email
    const { data: user } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", userId)
      .single();

    const { data: product } = await supabase
      .from("products")
      .select("name")
      .eq("id", productId)
      .single();

    // Send license email
    if (user && product) {
      await sendLicenseGeneratedEmail(
        userId,
        user.email || "",
        user.full_name || "Customer",
        product.name,
        licenseKey
      );
    }

    revalidatePath(LICENSES_PATH);
    revalidatePath(ADMIN_LICENSES_PATH);

    return { licenseId: license.id, licenseKey };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to generate license key.",
    };
  }
}

export async function updateLicenseStatus(
  _prevState: LicenseActionState,
  formData: FormData
): Promise<LicenseActionState> {
  const auth = await requireAdmin();

  if ("error" in auth) {
    return { error: auth.error };
  }

  const id = formData.get("id") as string;
  const status = formData.get("status") as string;

  if (!id) {
    return { error: "License ID is required." };
  }

  const parsed = updateLicenseStatusSchema.safeParse({ status });

  if (!parsed.success) {
    return { fieldErrors: mapZodErrors(parsed.error) };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("licenses")
    .update({ status: parsed.data.status })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(ADMIN_LICENSES_PATH);
  revalidatePath(`${ADMIN_LICENSES_PATH}/${id}`);
  return { success: "License status updated." };
}

export async function extendLicense(
  _prevState: LicenseActionState,
  formData: FormData
): Promise<LicenseActionState> {
  const auth = await requireAdmin();

  if ("error" in auth) {
    return { error: auth.error };
  }

  const id = formData.get("id") as string;
  const expiresAt = formData.get("expiresAt") as string;

  if (!id) {
    return { error: "License ID is required." };
  }

  const parsed = extendLicenseSchema.safeParse({ expiresAt });

  if (!parsed.success) {
    return { fieldErrors: mapZodErrors(parsed.error) };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("licenses")
    .update({
      expires_at: parsed.data.expiresAt,
      status: "active",
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(ADMIN_LICENSES_PATH);
  revalidatePath(`${ADMIN_LICENSES_PATH}/${id}`);
  return { success: "License extended successfully." };
}

export async function updateActivationLimit(
  _prevState: LicenseActionState,
  formData: FormData
): Promise<LicenseActionState> {
  const auth = await requireAdmin();

  if ("error" in auth) {
    return { error: auth.error };
  }

  const id = formData.get("id") as string;
  const maxActivations = formData.get("maxActivations") as string;

  if (!id) {
    return { error: "License ID is required." };
  }

  const parsed = updateActivationLimitSchema.safeParse({ maxActivations });

  if (!parsed.success) {
    return { fieldErrors: mapZodErrors(parsed.error) };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("licenses")
    .update({ max_activations: parsed.data.maxActivations })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(ADMIN_LICENSES_PATH);
  revalidatePath(`${ADMIN_LICENSES_PATH}/${id}`);
  return { success: "Activation limit updated." };
}

export async function deleteLicense(
  id: string
): Promise<{ error?: string; success?: string }> {
  const auth = await requireAdmin();

  if ("error" in auth) {
    return { error: auth.error };
  }

  if (!id) {
    return { error: "License ID is required." };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("licenses").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(ADMIN_LICENSES_PATH);
  return { success: "License deleted." };
}

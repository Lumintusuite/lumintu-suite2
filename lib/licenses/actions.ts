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
import { licenseRepository } from "@/lib/db/license-repository";
import { productRepository } from "@/lib/db/product-repository";
import { sendLicenseGeneratedEmail } from "@/lib/emails/actions";
import { LicenseStatus } from "@prisma/client";

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

  try {
    const licenseKey = await generateUniqueLicenseKey();

    await licenseRepository.createLicense({
      userId: parsed.data.userId,
      productId: parsed.data.productId,
      orderId: parsed.data.orderId,
      licenseKey,
      status: LicenseStatus.active,
      maxActivations: parseInt(parsed.data.maxActivations),
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : undefined,
    });

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
  try {
    const licenseKey = await generateUniqueLicenseKey();

    const license = await licenseRepository.createLicense({
      userId,
      productId,
      orderId,
      licenseKey,
      status: LicenseStatus.active,
      maxActivations: 1,
      expiresAt: calculateExpirationDate(1) ? new Date(calculateExpirationDate(1)) : undefined,
    });

    // Get user and product info for email
    const user = await licenseRepository.getUserById(userId);
    const product = await productRepository.getProductById(productId);

    // Send license email
    if (user && product) {
      await sendLicenseGeneratedEmail(
        userId,
        user.email || "",
        user.fullName || "Customer",
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

  try {
    await licenseRepository.updateLicense(id, {
      status: parsed.data.status as LicenseStatus,
    });
  } catch (error: any) {
    return { error: error.message || "Failed to update license status." };
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

  try {
    await licenseRepository.updateLicense(id, {
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : undefined,
      status: LicenseStatus.active,
    });
  } catch (error: any) {
    return { error: error.message || "Failed to extend license." };
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

  try {
    await licenseRepository.updateLicense(id, {
      maxActivations: parseInt(parsed.data.maxActivations),
    });
  } catch (error: any) {
    return { error: error.message || "Failed to update activation limit." };
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

  try {
    await licenseRepository.deleteLicense(id);
  } catch (error: any) {
    return { error: error.message || "Failed to delete license." };
  }

  revalidatePath(ADMIN_LICENSES_PATH);
  return { success: "License deleted." };
}

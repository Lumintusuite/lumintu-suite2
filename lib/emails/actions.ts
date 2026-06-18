import { createClient } from "@/lib/supabase/server";
import {
  getWelcomeEmailTemplate,
  getPurchaseSuccessEmailTemplate,
  getLicenseGeneratedEmailTemplate,
  getAffiliateApprovedEmailTemplate,
  getReferralSaleEmailTemplate,
  getCommissionCreatedEmailTemplate,
  getTestEmailTemplate,
} from "@/lib/emails/templates";

// Dynamic import for resend to handle when package isn't installed
let Resend: any = null;
try {
  Resend = require("resend").Resend;
} catch (e) {
  // Resend not installed, will handle gracefully
}

const resend = Resend ? new Resend(process.env.RESEND_API_KEY) : null;
const EMAIL_FROM = process.env.EMAIL_FROM || "noreply@lumintu-suite.com";

export type EmailType =
  | "welcome"
  | "purchase_success"
  | "license_generated"
  | "affiliate_approved"
  | "referral_sale"
  | "commission_created"
  | "test";

async function logEmail(
  userId: string | null,
  emailType: EmailType,
  status: "pending" | "sent" | "failed",
  errorMessage?: string
): Promise<void> {
  const supabase = await createClient();

  const updateData: any = {
    status,
  };

  if (status === "sent") {
    updateData.sent_at = new Date().toISOString();
  }

  if (errorMessage) {
    updateData.error_message = errorMessage;
  }

  await supabase.from("email_logs").insert({
    user_id: userId,
    email_type: emailType,
    status,
    ...updateData,
  });
}

async function checkDuplicateEmail(
  userId: string | null,
  emailType: EmailType,
  hours: number = 24
): Promise<boolean> {
  const supabase = await createClient();

  const cutoffTime = new Date();
  cutoffTime.setHours(cutoffTime.getHours() - hours);

  const { data } = await supabase
    .from("email_logs")
    .select("id")
    .eq("user_id", userId)
    .eq("email_type", emailType)
    .eq("status", "sent")
    .gte("created_at", cutoffTime.toISOString())
    .maybeSingle();

  return !!data;
}

export async function sendWelcomeEmail(
  userId: string,
  email: string,
  name: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check for duplicate
    const isDuplicate = await checkDuplicateEmail(userId, "welcome", 24);
    if (isDuplicate) {
      return { success: true }; // Already sent recently
    }

    const html = getWelcomeEmailTemplate(name);

    if (!resend) {
      await logEmail(userId, "welcome", "failed", "Resend package not installed");
      return { success: false, error: "Email service not configured" };
    }

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: "Welcome to Lumintu Suite",
      html,
    });

    if (error) {
      await logEmail(userId, "welcome", "failed", error.message);
      return { success: false, error: error.message };
    }

    await logEmail(userId, "welcome", "sent");
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to send email";
    await logEmail(userId, "welcome", "failed", errorMessage);
    return { success: false, error: errorMessage };
  }
}

export async function sendPurchaseSuccessEmail(
  userId: string,
  email: string,
  name: string,
  orderId: string,
  total: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const html = getPurchaseSuccessEmailTemplate(name, orderId, total);

    if (!resend) {
      await logEmail(userId, "purchase_success", "failed", "Resend package not installed");
      return { success: false, error: "Email service not configured" };
    }

    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: "Order Confirmation - Lumintu Suite",
      html,
    });

    if (error) {
      await logEmail(userId, "purchase_success", "failed", error.message);
      return { success: false, error: error.message };
    }

    await logEmail(userId, "purchase_success", "sent");
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to send email";
    await logEmail(userId, "purchase_success", "failed", errorMessage);
    return { success: false, error: errorMessage };
  }
}

export async function sendLicenseGeneratedEmail(
  userId: string,
  email: string,
  name: string,
  productName: string,
  licenseKey: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const html = getLicenseGeneratedEmailTemplate(name, productName, licenseKey);

    if (!resend) {
      await logEmail(userId, "license_generated", "failed", "Resend package not installed");
      return { success: false, error: "Email service not configured" };
    }

    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: "Your License is Ready - Lumintu Suite",
      html,
    });

    if (error) {
      await logEmail(userId, "license_generated", "failed", error.message);
      return { success: false, error: error.message };
    }

    await logEmail(userId, "license_generated", "sent");
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to send email";
    await logEmail(userId, "license_generated", "failed", errorMessage);
    return { success: false, error: errorMessage };
  }
}

export async function sendAffiliateApprovedEmail(
  userId: string,
  email: string,
  name: string,
  affiliateCode: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const html = getAffiliateApprovedEmailTemplate(name, affiliateCode);

    if (!resend) {
      await logEmail(userId, "affiliate_approved", "failed", "Resend package not installed");
      return { success: false, error: "Email service not configured" };
    }

    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: "Affiliate Application Approved - Lumintu Suite",
      html,
    });

    if (error) {
      await logEmail(userId, "affiliate_approved", "failed", error.message);
      return { success: false, error: error.message };
    }

    await logEmail(userId, "affiliate_approved", "sent");
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to send email";
    await logEmail(userId, "affiliate_approved", "failed", errorMessage);
    return { success: false, error: errorMessage };
  }
}

export async function sendReferralSaleEmail(
  userId: string,
  email: string,
  name: string,
  commissionAmount: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const html = getReferralSaleEmailTemplate(name, commissionAmount);

    if (!resend) {
      await logEmail(userId, "referral_sale", "failed", "Resend package not installed");
      return { success: false, error: "Email service not configured" };
    }

    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: "New Referral Sale - Lumintu Suite",
      html,
    });

    if (error) {
      await logEmail(userId, "referral_sale", "failed", error.message);
      return { success: false, error: error.message };
    }

    await logEmail(userId, "referral_sale", "sent");
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to send email";
    await logEmail(userId, "referral_sale", "failed", errorMessage);
    return { success: false, error: errorMessage };
  }
}

export async function sendCommissionCreatedEmail(
  userId: string,
  email: string,
  name: string,
  commissionAmount: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const html = getCommissionCreatedEmailTemplate(name, commissionAmount);

    if (!resend) {
      await logEmail(userId, "commission_created", "failed", "Resend package not installed");
      return { success: false, error: "Email service not configured" };
    }

    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: "Commission Approved - Lumintu Suite",
      html,
    });

    if (error) {
      await logEmail(userId, "commission_created", "failed", error.message);
      return { success: false, error: error.message };
    }

    await logEmail(userId, "commission_created", "sent");
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to send email";
    await logEmail(userId, "commission_created", "failed", errorMessage);
    return { success: false, error: errorMessage };
  }
}

export async function sendTestEmail(
  email: string,
  name: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const html = getTestEmailTemplate(name);

    if (!resend) {
      await logEmail(null, "test", "failed", "Resend package not installed");
      return { success: false, error: "Email service not configured" };
    }

    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: "Test Email - Lumintu Suite",
      html,
    });

    if (error) {
      await logEmail(null, "test", "failed", error.message);
      return { success: false, error: error.message };
    }

    await logEmail(null, "test", "sent");
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to send email";
    await logEmail(null, "test", "failed", errorMessage);
    return { success: false, error: errorMessage };
  }
}

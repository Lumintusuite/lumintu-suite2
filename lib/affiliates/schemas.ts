import { z } from "zod";

export const registerAffiliateSchema = z.object({
  affiliateCode: z
    .string()
    .min(3, "Affiliate code must be at least 3 characters.")
    .max(20, "Affiliate code must be 20 characters or less.")
    .regex(/^[A-Z0-9_-]+$/, "Affiliate code can only contain uppercase letters, numbers, hyphens, and underscores."),
});

export const updateAffiliateStatusSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"], {
    error: "Status must be pending, approved, or rejected.",
  }),
});

export const updateCommissionRateSchema = z.object({
  commissionRate: z.coerce
    .number({ error: "Commission rate must be a valid number." })
    .min(0, "Commission rate cannot be negative.")
    .max(100, "Commission rate cannot exceed 100%.")
    .step(0.01, "Commission rate must be in increments of 0.01."),
});

export const createReferralSchema = z.object({
  affiliateId: z.string().uuid("Invalid affiliate ID."),
  orderId: z.string().uuid("Invalid order ID."),
  commissionAmount: z.coerce
    .number({ error: "Commission amount must be a valid number." })
    .min(0, "Commission amount cannot be negative.")
    .max(999999999.99, "Commission amount is too large."),
});

export const updateReferralStatusSchema = z.object({
  status: z.enum(["pending", "approved"], {
    error: "Status must be pending or approved.",
  }),
});

export const createNotificationSchema = z.object({
  affiliateId: z.string().uuid("Invalid affiliate ID."),
  title: z.string().min(1, "Title is required.").max(200, "Title must be 200 characters or less."),
  message: z.string().min(1, "Message is required.").max(1000, "Message must be 1000 characters or less."),
});

export type RegisterAffiliateFormValues = z.infer<typeof registerAffiliateSchema>;
export type UpdateAffiliateStatusFormValues = z.infer<typeof updateAffiliateStatusSchema>;
export type UpdateCommissionRateFormValues = z.infer<typeof updateCommissionRateSchema>;
export type CreateReferralFormValues = z.infer<typeof createReferralSchema>;
export type UpdateReferralStatusFormValues = z.infer<typeof updateReferralStatusSchema>;
export type CreateNotificationFormValues = z.infer<typeof createNotificationSchema>;

export function mapZodErrors(
  error: z.ZodError
): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  for (const issue of error.issues) {
    const key = issue.path[0];

    if (typeof key === "string" && !fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }

  return fieldErrors;
}

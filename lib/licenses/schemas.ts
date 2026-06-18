import { z } from "zod";

export const createLicenseSchema = z.object({
  userId: z.string().uuid("Invalid user ID."),
  productId: z.string().uuid("Invalid product ID."),
  orderId: z.string().uuid("Invalid order ID.").optional(),
  maxActivations: z.coerce
    .number({ error: "Max activations must be a valid number." })
    .int("Max activations must be a whole number.")
    .min(1, "Max activations must be at least 1.")
    .max(100, "Max activations cannot exceed 100."),
  expiresAt: z.string().optional(),
});

export const updateLicenseStatusSchema = z.object({
  status: z.enum(["active", "expired", "suspended"], {
    error: "Status must be active, expired, or suspended.",
  }),
});

export const extendLicenseSchema = z.object({
  expiresAt: z.string({
    error: "Expiration date is required.",
  }),
});

export const updateActivationLimitSchema = z.object({
  maxActivations: z.coerce
    .number({ error: "Max activations must be a valid number." })
    .int("Max activations must be a whole number.")
    .min(1, "Max activations must be at least 1.")
    .max(100, "Max activations cannot exceed 100."),
});

export const createLicenseActivationSchema = z.object({
  licenseId: z.string().uuid("Invalid license ID."),
  deviceName: z.string().max(255, "Device name must be 255 characters or less.").optional(),
  domainName: z.string().max(255, "Domain name must be 255 characters or less.").optional(),
  ipAddress: z.string().max(45, "IP address must be 45 characters or less.").optional(),
});

export type CreateLicenseFormValues = z.infer<typeof createLicenseSchema>;
export type UpdateLicenseStatusFormValues = z.infer<typeof updateLicenseStatusSchema>;
export type ExtendLicenseFormValues = z.infer<typeof extendLicenseSchema>;
export type UpdateActivationLimitFormValues = z.infer<typeof updateActivationLimitSchema>;
export type CreateLicenseActivationFormValues = z.infer<typeof createLicenseActivationSchema>;

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

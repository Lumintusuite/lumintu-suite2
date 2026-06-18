import { z } from "zod";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(100, "Name must be 100 characters or less."),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required.")
    .max(100, "Slug must be 100 characters or less.")
    .regex(slugRegex, "Slug must be lowercase letters, numbers, and hyphens."),
  description: z
    .string()
    .trim()
    .max(1000, "Description must be 1000 characters or less.")
    .optional()
    .transform((value) => value || null),
});

export const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(200, "Name must be 200 characters or less."),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required.")
    .max(200, "Slug must be 200 characters or less.")
    .regex(slugRegex, "Slug must be lowercase letters, numbers, and hyphens."),
  description: z
    .string()
    .trim()
    .max(5000, "Description must be 5000 characters or less.")
    .optional()
    .transform((value) => value || null),
  price: z.coerce
    .number({ error: "Price must be a valid number." })
    .min(0, "Price cannot be negative.")
    .max(999999.99, "Price is too large."),
  categoryId: z.preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined) {
        return null;
      }
      return value;
    },
    z.union([z.string().uuid("Select a valid category."), z.null()])
  ),
  status: z.enum(["draft", "published"], {
    error: "Status must be draft or published.",
  }),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
export type ProductFormValues = z.infer<typeof productSchema>;

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

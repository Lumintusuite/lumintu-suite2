import type { License, LicenseActivation } from "@/lib/types";

export type { License, LicenseActivation } from "@/lib/types";

export type LicenseActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string>;
};

import type { License, LicenseActivation } from "@/lib/supabase/types";

export type { License, LicenseActivation };

export type LicenseActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string>;
};

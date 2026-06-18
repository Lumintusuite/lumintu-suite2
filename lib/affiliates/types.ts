import type { Affiliate, Referral, ReferralClick, AffiliateNotification } from "@/lib/supabase/types";

export type { Affiliate, Referral, ReferralClick, AffiliateNotification };

export type AffiliateActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string>;
};

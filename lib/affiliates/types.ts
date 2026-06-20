import type { Affiliate, Referral, ReferralClick, AffiliateNotification } from "@/lib/types";

export type { Affiliate, Referral, ReferralClick, AffiliateNotification } from "@/lib/types";

export type AffiliateActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string>;
};

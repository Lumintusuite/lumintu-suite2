import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";
import { getAffiliateByUserId, getReferralStats } from "@/lib/affiliates/queries";
import { registerAffiliate } from "@/lib/affiliates/actions";
import { generateReferralUrl } from "@/lib/affiliates/tracking";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function MemberAffiliatePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const affiliate = await getAffiliateByUserId(user.id);

  if (!affiliate) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-md">
          <h1 className="mb-2 text-3xl font-bold">Become an Affiliate</h1>
          <p className="mb-6 text-gray-600">
            Join our affiliate program and earn commissions on referrals.
          </p>

          <form
            action={async (formData: FormData) => {
              "use server";
              await registerAffiliate({}, formData);
              redirect("/affiliate");
            }}
            className="space-y-4"
          >
            <div>
              <Label className="mb-2 block text-sm font-medium">
                Affiliate Code
              </Label>
              <Input
                name="affiliateCode"
                placeholder="YOURCODE"
                required
                pattern="^[A-Z0-9_-]{3,20}$"
                className="uppercase"
              />
              <p className="mt-1 text-sm text-gray-600">
                3-20 characters, uppercase letters, numbers, hyphens, and underscores only.
              </p>
            </div>
            <Button type="submit" className="w-full">
              Apply for Affiliate Program
            </Button>
          </form>
        </div>
      </div>
    );
  }

  const stats = await getReferralStats(affiliate.id);
  const referralUrl = generateReferralUrl(affiliate.affiliate_code);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">My Affiliate Dashboard</h1>
        <p className="text-gray-600">
          Status:{" "}
          <Badge
            variant={
              affiliate.status === "approved"
                ? "default"
                : affiliate.status === "rejected"
                ? "destructive"
                : "secondary"
            }
          >
            {affiliate.status}
          </Badge>
        </p>
      </div>

      {affiliate.status === "approved" && (
        <>
          <div className="mb-8 grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-gray-600">Total Clicks</p>
              <p className="text-2xl font-bold">{stats.totalClicks}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold">{stats.totalReferrals}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-gray-600">Total Commission</p>
              <p className="text-2xl font-bold">
                ${stats.totalCommission.toFixed(2)}
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-gray-600">Pending Commission</p>
              <p className="text-2xl font-bold text-yellow-600">
                ${stats.pendingCommission.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="mb-8 rounded-lg border p-6">
            <h2 className="mb-4 text-xl font-semibold">Referral Link</h2>
            <div className="flex gap-2">
              <Input
                value={referralUrl}
                readOnly
                className="font-mono"
              />
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(referralUrl);
                }}
              >
                Copy
              </Button>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Share this link to earn commissions on sales.
            </p>
          </div>

          <div className="mb-8">
            <Button
              variant="outline"
              onClick={() => redirect("/affiliate/referrals")}
            >
              View Referral History
            </Button>
          </div>
        </>
      )}

      {affiliate.status === "pending" && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 text-yellow-800">
          <p className="font-semibold">Application Pending</p>
          <p className="mt-2">
            Your affiliate application is under review. You will be notified once it's approved.
          </p>
        </div>
      )}

      {affiliate.status === "rejected" && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800">
          <p className="font-semibold">Application Rejected</p>
          <p className="mt-2">
            Your affiliate application was rejected. Please contact support for more information.
          </p>
        </div>
      )}
    </div>
  );
}

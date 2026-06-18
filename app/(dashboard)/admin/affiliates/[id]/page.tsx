import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/get-user";
import { getAffiliateById, getReferralStats } from "@/lib/affiliates/queries";
import { updateAffiliateStatus, updateCommissionRate } from "@/lib/affiliates/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function AdminAffiliateDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();

  if (!user || user.profile.role !== "admin") {
    redirect("/login");
  }

  const affiliate = await getAffiliateById(params.id);

  if (!affiliate) {
    redirect("/admin/affiliates");
  }

  const stats = await getReferralStats(params.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Affiliate Details</h1>
        <p className="text-gray-600">
          Affiliate Code: <span className="font-mono">{affiliate.affiliate_code}</span>
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border p-6">
          <h2 className="mb-4 text-xl font-semibold">Affiliate Information</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">User:</span>
              <span>{(affiliate as any).profiles?.full_name || (affiliate as any).profiles?.email || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
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
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Commission Rate:</span>
              <span>{affiliate.commission_rate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Joined:</span>
              <span>{new Date(affiliate.created_at).toLocaleString()}</span>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <form
              action={async (formData: FormData) => {
                "use server";
                await updateAffiliateStatus({}, formData);
              }}
            >
              <input type="hidden" name="id" value={affiliate.id} />
              <div>
                <Label className="mb-2 block text-sm font-medium">
                  Update Status
                </Label>
                <Select name="status" defaultValue={affiliate.status}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="mt-2">
                Update Status
              </Button>
            </form>

            <form
              action={async (formData: FormData) => {
                "use server";
                await updateCommissionRate({}, formData);
              }}
            >
              <input type="hidden" name="id" value={affiliate.id} />
              <div>
                <Label className="mb-2 block text-sm font-medium">
                  Commission Rate (%)
                </Label>
                <Input
                  name="commissionRate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  defaultValue={affiliate.commission_rate}
                />
              </div>
              <Button type="submit" className="mt-2">
                Update Rate
              </Button>
            </form>
          </div>
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="mb-4 text-xl font-semibold">Performance Stats</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Clicks:</span>
              <span className="text-2xl font-bold">{stats.totalClicks}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Referrals:</span>
              <span className="text-2xl font-bold">{stats.totalReferrals}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Commission:</span>
              <span className="text-2xl font-bold">
                ${stats.totalCommission.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pending Commission:</span>
              <span className="text-2xl font-bold text-yellow-600">
                ${stats.pendingCommission.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Approved Commission:</span>
              <span className="text-2xl font-bold text-green-600">
                ${stats.approvedCommission.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Button variant="outline" onClick={() => redirect("/admin/affiliates")}>
          Back to Affiliates
        </Button>
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";
import { getAffiliateByUserId, listReferrals } from "@/lib/affiliates/queries";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function MemberReferralsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const affiliate = await getAffiliateByUserId(user.id);

  if (!affiliate || affiliate.status !== "approved") {
    redirect("/affiliate");
  }

  const page = parseInt(searchParams.page || "1", 10);
  const result = await listReferrals({ page, affiliateId: affiliate.id });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">My Referrals</h1>
        <p className="text-gray-600">View your referral sales and commissions</p>
      </div>

      {result.items.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <p className="text-gray-600">No referrals yet</p>
          <Button className="mt-4" onClick={() => redirect("/affiliate")}>
            Back to Dashboard
          </Button>
        </div>
      ) : (
        <>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Order Total</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.items.map((referral: any) => (
                  <TableRow key={referral.id}>
                    <TableCell className="font-mono text-sm">
                      {referral.orderId.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      ${(referral.order?.total || 0).toFixed(2)}
                    </TableCell>
                    <TableCell className="font-bold">
                      ${referral.commissionAmount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          referral.status === "approved"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {referral.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(referral.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {result.totalPages > 1 && (
            <div className="mt-4 flex justify-center gap-2">
              {page > 1 && (
                <Button
                  variant="outline"
                  onClick={() => redirect(`/affiliate/referrals?page=${page - 1}`)}
                >
                  Previous
                </Button>
              )}
              <span className="flex items-center px-4">
                Page {page} of {result.totalPages}
              </span>
              {page < result.totalPages && (
                <Button
                  variant="outline"
                  onClick={() => redirect(`/affiliate/referrals?page=${page + 1}`)}
                >
                  Next
                </Button>
              )}
            </div>
          )}

          <div className="mt-6">
            <Button variant="outline" onClick={() => redirect("/affiliate")}>
              Back to Dashboard
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

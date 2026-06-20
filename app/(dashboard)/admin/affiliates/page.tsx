import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";
import { listAffiliates, getAffiliateStats } from "@/lib/affiliates/queries";
import { approveAffiliate, rejectAffiliate } from "@/lib/affiliates/actions";
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

export default async function AdminAffiliatesPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    redirect("/login");
  }

  const page = parseInt(searchParams.page || "1", 10);
  const [result, stats] = await Promise.all([
    listAffiliates({ page }),
    getAffiliateStats(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Affiliates</h1>
        <p className="text-gray-600">Manage affiliate accounts</p>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-gray-600">Total Affiliates</p>
          <p className="text-2xl font-bold">{stats.totalAffiliates}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-gray-600">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {stats.activeAffiliates}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">
            {stats.pendingAffiliates}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-gray-600">Total Commission</p>
          <p className="text-2xl font-bold">
            ${stats.totalCommission.toFixed(2)}
          </p>
        </div>
      </div>

      {result.items.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <p className="text-gray-600">No affiliates yet</p>
        </div>
      ) : (
        <>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Affiliate Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Commission Rate</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.items.map((affiliate: any) => (
                  <TableRow key={affiliate.id}>
                    <TableCell>
                      {affiliate.profile?.fullName || affiliate.profile?.email || "-"}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {affiliate.affiliateCode}
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>{affiliate.commissionRate}%</TableCell>
                    <TableCell>
                      {new Date(affiliate.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {affiliate.status === "pending" && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              "use server";
                              await approveAffiliate(affiliate.id);
                              redirect("/admin/affiliates");
                            }}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              "use server";
                              await rejectAffiliate(affiliate.id);
                              redirect("/admin/affiliates");
                            }}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => redirect(`/admin/affiliates/${affiliate.id}`)}
                      >
                        View
                      </Button>
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
                  onClick={() => redirect(`/admin/affiliates?page=${page - 1}`)}
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
                  onClick={() => redirect(`/admin/affiliates?page=${page + 1}`)}
                >
                  Next
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

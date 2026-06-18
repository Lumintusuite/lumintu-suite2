import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/get-user";
import { listReferrals } from "@/lib/affiliates/queries";
import { updateReferralStatus } from "@/lib/affiliates/actions";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default async function AdminReferralsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const user = await getCurrentUser();

  if (!user || user.profile.role !== "admin") {
    redirect("/login");
  }

  const page = parseInt(searchParams.page || "1", 10);
  const result = await listReferrals({ page });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Referrals</h1>
        <p className="text-gray-600">Manage affiliate referrals and commissions</p>
      </div>

      {result.items.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <p className="text-gray-600">No referrals yet</p>
        </div>
      ) : (
        <>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Affiliate ID</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Order Total</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.items.map((referral: any) => (
                  <TableRow key={referral.id}>
                    <TableCell className="font-mono text-sm">
                      {referral.affiliate_id.slice(0, 8)}...
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {referral.order_id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      ${(referral.orders?.total || 0).toFixed(2)}
                    </TableCell>
                    <TableCell className="font-bold">
                      ${referral.commission_amount.toFixed(2)}
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
                      {new Date(referral.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <form
                        action={async (formData: FormData) => {
                          "use server";
                          await updateReferralStatus({}, formData);
                          redirect("/admin/referrals");
                        }}
                      >
                        <input type="hidden" name="id" value={referral.id} />
                        <Select name="status" defaultValue={referral.status}>
                          <SelectTrigger className="h-8 w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button type="submit" size="sm" className="ml-2">
                          Update
                        </Button>
                      </form>
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
                  onClick={() => redirect(`/admin/referrals?page=${page - 1}`)}
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
                  onClick={() => redirect(`/admin/referrals?page=${page + 1}`)}
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

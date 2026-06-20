import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";
import { listUserPayments } from "@/lib/payments/queries";
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

export default async function MemberPaymentsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const page = parseInt(searchParams.page || "1", 10);
  const result = await listUserPayments(user.id, { page });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">My Payments</h1>
        <p className="text-gray-600">View your payment history</p>
      </div>

      {result.items.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <p className="text-gray-600">No payments yet</p>
          <Button className="mt-4" onClick={() => redirect("/")}>
            Browse Products
          </Button>
        </div>
      ) : (
        <>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.items.map((payment: any) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-mono text-sm">
                      {payment.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {payment.orderId.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      {payment.paymentMethod || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          payment.status === "paid"
                            ? "default"
                            : payment.status === "pending"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      ${payment.grossAmount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => redirect(`/payments/${payment.id}`)}
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
                  onClick={() => redirect(`/payments?page=${page - 1}`)}
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
                  onClick={() => redirect(`/payments?page=${page + 1}`)}
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

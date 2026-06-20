import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";
import { listUserLicenses } from "@/lib/licenses/queries";
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

export default async function MemberLicensesPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const page = parseInt(searchParams.page || "1", 10);
  const result = await listUserLicenses(user.id, { page });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">My Licenses</h1>
        <p className="text-gray-600">View and manage your product licenses</p>
      </div>

      {result.items.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <p className="text-gray-600">No licenses yet</p>
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
                  <TableHead>License Key</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Activations</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.items.map((license: any) => (
                  <TableRow key={license.id}>
                    <TableCell className="font-mono text-sm">
                      {license.licenseKey}
                    </TableCell>
                    <TableCell>
                      {license.product?.name || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          license.status === "active"
                            ? "default"
                            : license.status === "expired"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {license.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {license.activationCount}/{license.maxActivations}
                    </TableCell>
                    <TableCell>
                      {license.expiresAt
                        ? new Date(license.expiresAt).toLocaleDateString()
                        : "Never"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => redirect(`/licenses/${license.id}`)}
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
                  onClick={() => redirect(`/licenses?page=${page - 1}`)}
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
                  onClick={() => redirect(`/licenses?page=${page + 1}`)}
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

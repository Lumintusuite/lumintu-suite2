import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/get-user";
import { listLicenses, getLicenseStats } from "@/lib/licenses/queries";
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

export default async function AdminLicensesPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const user = await getCurrentUser();

  if (!user || user.profile.role !== "admin") {
    redirect("/login");
  }

  const page = parseInt(searchParams.page || "1", 10);
  const [result, stats] = await Promise.all([
    listLicenses({ page }),
    getLicenseStats(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Licenses</h1>
        <p className="text-gray-600">Manage all licenses</p>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-gray-600">Total Licenses</p>
          <p className="text-2xl font-bold">{stats.totalLicenses}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-gray-600">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {stats.activeLicenses}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-gray-600">Expired</p>
          <p className="text-2xl font-bold text-red-600">
            {stats.expiredLicenses}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-gray-600">Suspended</p>
          <p className="text-2xl font-bold text-yellow-600">
            {stats.suspendedLicenses}
          </p>
        </div>
      </div>

      {result.items.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <p className="text-gray-600">No licenses yet</p>
        </div>
      ) : (
        <>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>License Key</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>User</TableHead>
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
                      {license.license_key}
                    </TableCell>
                    <TableCell>
                      {license.products?.name || "-"}
                    </TableCell>
                    <TableCell>
                      {license.profiles?.full_name || license.profiles?.email || "-"}
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
                      {license.activation_count}/{license.max_activations}
                    </TableCell>
                    <TableCell>
                      {license.expires_at
                        ? new Date(license.expires_at).toLocaleDateString()
                        : "Never"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => redirect(`/admin/licenses/${license.id}`)}
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
                  onClick={() => redirect(`/admin/licenses?page=${page - 1}`)}
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
                  onClick={() => redirect(`/admin/licenses?page=${page + 1}`)}
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

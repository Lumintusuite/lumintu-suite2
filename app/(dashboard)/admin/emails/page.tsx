import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";
import { listEmailLogs, getEmailStats } from "@/lib/emails/queries";
import { sendTestEmail } from "@/lib/emails/actions";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function AdminEmailsPage({
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
    listEmailLogs({ page }),
    getEmailStats(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Email Logs</h1>
        <p className="text-gray-600">View and manage email activity</p>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-gray-600">Total Emails</p>
          <p className="text-2xl font-bold">{stats.totalEmails}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-gray-600">Sent</p>
          <p className="text-2xl font-bold text-green-600">
            {stats.sentEmails}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-gray-600">Failed</p>
          <p className="text-2xl font-bold text-red-600">
            {stats.failedEmails}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">
            {stats.pendingEmails}
          </p>
        </div>
      </div>

      <div className="mb-8 rounded-lg border p-6">
        <h2 className="mb-4 text-xl font-semibold">Send Test Email</h2>
        <form
          action={async (formData: FormData) => {
            "use server";
            const email = formData.get("email") as string;
            const name = formData.get("name") as string;
            await sendTestEmail(email, name);
            redirect("/admin/emails");
          }}
          className="flex gap-4 items-end"
        >
          <div className="flex-1">
            <Label className="mb-2 block text-sm font-medium">
              Email Address
            </Label>
            <Input name="email" type="email" placeholder="test@example.com" required />
          </div>
          <div className="flex-1">
            <Label className="mb-2 block text-sm font-medium">
              Name
            </Label>
            <Input name="name" type="text" placeholder="Test User" required />
          </div>
          <Button type="submit">Send Test Email</Button>
        </form>
      </div>

      {result.items.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <p className="text-gray-600">No email logs yet</p>
        </div>
      ) : (
        <>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent At</TableHead>
                  <TableHead>Error</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.items.map((log: any) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-sm">
                      {log.emailType}
                    </TableCell>
                    <TableCell>
                      {log.profile?.email || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          log.status === "sent"
                            ? "default"
                            : log.status === "failed"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {log.sentAt
                        ? new Date(log.sentAt).toLocaleString()
                        : "-"}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-red-600">
                      {log.errorMessage || "-"}
                    </TableCell>
                    <TableCell>
                      {new Date(log.createdAt).toLocaleString()}
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
                  onClick={() => redirect(`/admin/emails?page=${page - 1}`)}
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
                  onClick={() => redirect(`/admin/emails?page=${page + 1}`)}
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

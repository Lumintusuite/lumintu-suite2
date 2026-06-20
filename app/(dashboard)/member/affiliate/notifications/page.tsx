import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";
import { getAffiliateByUserId, listNotifications, markNotificationAsRead } from "@/lib/affiliates/queries";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function MemberNotificationsPage({
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
  const result = await listNotifications(affiliate.id, { page });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">My Notifications</h1>
        <p className="text-gray-600">View your affiliate notifications</p>
      </div>

      {result.items.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <p className="text-gray-600">No notifications yet</p>
          <Button className="mt-4" onClick={() => redirect("/affiliate")}>
            Back to Dashboard
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {result.items.map((notification: any) => (
              <div
                key={notification.id}
                className={`rounded-lg border p-4 ${
                  !notification.isRead ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{notification.title}</h3>
                      {!notification.isRead && (
                        <Badge variant="secondary">New</Badge>
                      )}
                    </div>
                    <p className="mt-2 text-gray-600">{notification.message}</p>
                    <p className="mt-2 text-sm text-gray-500">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <form
                      action={async () => {
                        "use server";
                        await markNotificationAsRead(notification.id);
                        redirect("/affiliate/notifications");
                      }}
                    >
                      <Button type="submit" size="sm" variant="outline">
                        Mark as Read
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            ))}
          </div>

          {result.totalPages > 1 && (
            <div className="mt-4 flex justify-center gap-2">
              {page > 1 && (
                <Button
                  variant="outline"
                  onClick={() => redirect(`/affiliate/notifications?page=${page - 1}`)}
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
                  onClick={() => redirect(`/affiliate/notifications?page=${page + 1}`)}
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

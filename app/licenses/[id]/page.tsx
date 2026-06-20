import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";
import { getLicenseById, getLicenseActivations } from "@/lib/licenses/queries";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function LicenseDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const license = await getLicenseById(params.id);

  if (!license) {
    redirect("/licenses");
  }

  // Verify the license belongs to the user or user is admin
  const isAdmin = user.role === "admin";
  
  if (!isAdmin && license.userId !== user.id) {
    redirect("/licenses");
  }

  const activations = await getLicenseActivations(params.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">License Details</h1>
        <p className="text-gray-600">
          License Key: <span className="font-mono">{license.licenseKey}</span>
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border p-6">
          <h2 className="mb-4 text-xl font-semibold">License Information</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Product:</span>
              <span>{(license as any).product?.name || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
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
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Activations:</span>
              <span>
                {license.activationCount}/{license.maxActivations}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Expires At:</span>
              <span>
                {license.expiresAt
                  ? new Date(license.expiresAt).toLocaleString()
                  : "Never"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Created At:</span>
              <span>{new Date(license.createdAt).toLocaleString()}</span>
            </div>
          </div>

          <div className="mt-6">
            <Button
              onClick={() => {
                navigator.clipboard.writeText(license.licenseKey);
              }}
            >
              Copy License Key
            </Button>
          </div>
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="mb-4 text-xl font-semibold">Activation History</h2>
          {activations.length === 0 ? (
            <p className="text-gray-600">No activations yet</p>
          ) : (
            <div className="space-y-2">
              {activations.map((activation: any) => (
                <div
                  key={activation.id}
                  className="rounded-lg border p-3"
                >
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Device: {activation.deviceName || "-"}
                    </span>
                    <span className="text-sm text-gray-600">
                      {new Date(activation.activatedAt).toLocaleString()}
                    </span>
                  </div>
                  {activation.domainName && (
                    <p className="text-sm text-gray-600">
                      Domain: {activation.domainName}
                    </p>
                  )}
                  {activation.ipAddress && (
                    <p className="text-sm text-gray-600">
                      IP: {activation.ipAddress}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <Button variant="outline" onClick={() => redirect("/licenses")}>
          Back to Licenses
        </Button>
      </div>
    </div>
  );
}

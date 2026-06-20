import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";
import { getLicenseById, getLicenseActivations } from "@/lib/licenses/queries";
import { updateLicenseStatus, extendLicense, updateActivationLimit, deleteLicense } from "@/lib/licenses/actions";
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

export default async function AdminLicenseDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    redirect("/login");
  }

  const license = await getLicenseById(params.id);

  if (!license) {
    redirect("/admin/licenses");
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
              <span className="text-gray-600">User:</span>
              <span>{(license as any).profile?.fullName || (license as any).profile?.email || "-"}</span>
            </div>
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

          <div className="mt-6 space-y-4">
            <form
              action={async (formData: FormData) => {
                "use server";
                await updateLicenseStatus({}, formData);
              }}
            >
              <input type="hidden" name="id" value={license.id} />
              <div>
                <Label className="mb-2 block text-sm font-medium">
                  Update Status
                </Label>
                <Select name="status" defaultValue={license.status}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
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
                await updateActivationLimit({}, formData);
              }}
            >
              <input type="hidden" name="id" value={license.id} />
              <div>
                <Label className="mb-2 block text-sm font-medium">
                  Max Activations
                </Label>
                <Input
                  name="maxActivations"
                  type="number"
                  defaultValue={license.maxActivations}
                  min="1"
                  max="100"
                />
              </div>
              <Button type="submit" className="mt-2">
                Update Limit
              </Button>
            </form>

            <form
              action={async (formData: FormData) => {
                "use server";
                await extendLicense({}, formData);
              }}
            >
              <input type="hidden" name="id" value={license.id} />
              <div>
                <Label className="mb-2 block text-sm font-medium">
                  Extend Expiration
                </Label>
                <Input
                  name="expiresAt"
                  type="datetime-local"
                  required
                />
              </div>
              <Button type="submit" className="mt-2">
                Extend License
              </Button>
            </form>

            <form
              action={async () => {
                "use server";
                await deleteLicense(license.id);
                redirect("/admin/licenses");
              }}
            >
              <Button type="submit" variant="destructive">
                Delete License
              </Button>
            </form>
          </div>
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="mb-4 text-xl font-semibold">Activation History</h2>
          {activations.length === 0 ? (
            <p className="text-gray-600">No activations yet</p>
          ) : (
            <div className="space-y-2">
              {activations.map((activation) => (
                <div
                  key={activation.id}
                  className="rounded-lg border p-3"
                >
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Device: {activation.device_name || "-"}
                    </span>
                    <span className="text-sm text-gray-600">
                      {new Date(activation.activated_at).toLocaleString()}
                    </span>
                  </div>
                  {activation.domain_name && (
                    <p className="text-sm text-gray-600">
                      Domain: {activation.domain_name}
                    </p>
                  )}
                  {activation.ip_address && (
                    <p className="text-sm text-gray-600">
                      IP: {activation.ip_address}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <Button variant="outline" onClick={() => redirect("/admin/licenses")}>
          Back to Licenses
        </Button>
      </div>
    </div>
  );
}

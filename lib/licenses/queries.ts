import { getCurrentUser } from "@/lib/auth/session";
import type { AuthUser } from "@/lib/auth/types";
import {
  DEFAULT_PAGE_SIZE,
  type PaginatedResult,
} from "@/lib/catalog/types";
import { licenseRepository } from "@/lib/db/license-repository";
import { LicenseStatus } from "@prisma/client";

export async function requireAuthenticated(): Promise<
  { user: AuthUser } | { error: string }
> {
  const user = await getCurrentUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  return { user };
}

export async function requireAdmin(): Promise<
  { user: AuthUser } | { error: string }
> {
  const user = await getCurrentUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  if (user.role !== "admin") {
    return { error: "Admin access required." };
  }

  return { user };
}

type ListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
};

function getPaginationRange(page: number, pageSize: number) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return { from, to };
}

export async function listLicenses({
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  search = "",
}: ListParams = {}): Promise<PaginatedResult<any>> {
  const { from, to } = getPaginationRange(page, pageSize);

  let licenses = await licenseRepository.getAllLicenses();

  if (search.trim()) {
    licenses = await licenseRepository.getAllLicenses({ search: search.trim() });
  }

  const total = licenses.length;
  const items = licenses.slice(from, to + 1);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function listUserLicenses(
  userId: string,
  { page = 1, pageSize = DEFAULT_PAGE_SIZE }: Omit<ListParams, "search"> = {}
): Promise<PaginatedResult<any>> {
  const { from, to } = getPaginationRange(page, pageSize);

  let licenses = await licenseRepository.getAllLicenses({ userId });

  const total = licenses.length;
  const items = licenses.slice(from, to + 1);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getLicenseById(
  id: string
): Promise<any | null> {
  return licenseRepository.getLicenseById(id);
}

export async function getLicenseByKey(
  licenseKey: string
): Promise<any | null> {
  return licenseRepository.getLicenseByKey(licenseKey);
}

export async function getLicenseActivations(
  licenseId: string
): Promise<any[]> {
  return licenseRepository.getLicenseActivations(licenseId);
}

export async function getLicenseStats(): Promise<{
  totalLicenses: number;
  activeLicenses: number;
  expiredLicenses: number;
  suspendedLicenses: number;
}> {
  const [totalLicenses, activeLicenses, expiredLicenses, suspendedLicenses] = await Promise.all([
    licenseRepository.getLicensesCount(),
    licenseRepository.getLicensesCount({ status: LicenseStatus.active }),
    licenseRepository.getLicensesCount({ status: LicenseStatus.expired }),
    licenseRepository.getLicensesCount({ status: LicenseStatus.suspended }),
  ]);

  return {
    totalLicenses,
    activeLicenses,
    expiredLicenses,
    suspendedLicenses,
  };
}

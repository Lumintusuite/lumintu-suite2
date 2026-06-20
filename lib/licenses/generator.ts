import { licenseRepository } from "@/lib/db/license-repository";

const LICENSE_PREFIX = "LUM";
const SEGMENT_LENGTH = 4;
const SEGMENT_COUNT = 3;

function generateRandomSegment(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateLicenseKey(): string {
  const segments: string[] = [];
  for (let i = 0; i < SEGMENT_COUNT; i++) {
    segments.push(generateRandomSegment(SEGMENT_LENGTH));
  }
  return `${LICENSE_PREFIX}-${segments.join("-")}`;
}

export async function isLicenseKeyUnique(
  licenseKey: string
): Promise<boolean> {
  const existingLicense = await licenseRepository.getLicenseByKey(licenseKey);
  return existingLicense === null;
}

export async function generateUniqueLicenseKey(
  maxAttempts: number = 10
): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    const licenseKey = generateLicenseKey();
    const isUnique = await isLicenseKeyUnique(licenseKey);
    
    if (isUnique) {
      return licenseKey;
    }
  }

  throw new Error("Failed to generate unique license key after maximum attempts");
}

export function calculateExpirationDate(
  years: number = 1
): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() + years);
  return date.toISOString();
}

export function isLicenseExpired(expiresAt: string | null): boolean {
  if (!expiresAt) {
    return false;
  }
  return new Date(expiresAt) < new Date();
}

export function canActivateLicense(
  activationCount: number,
  maxActivations: number,
  status: string
): boolean {
  if (status !== "active") {
    return false;
  }
  return activationCount < maxActivations;
}

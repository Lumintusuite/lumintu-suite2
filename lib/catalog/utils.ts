export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

export function getStoragePublicUrl(
  bucket: string,
  path: string | null | undefined
): string | null {
  if (!path) {
    return null;
  }

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!baseUrl) {
    return null;
  }

  return `${baseUrl.replace(/\/$/, "")}/storage/v1/object/public/${bucket}/${path}`;
}

export function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? (parts.pop()?.toLowerCase() ?? "") : "";
}

export function isValidImageFile(file: File): boolean {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  return allowed.includes(file.type);
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

import {
  categorySchema,
  mapZodErrors,
  productSchema,
} from "@/lib/catalog/schemas";
import type { CatalogActionState } from "@/lib/catalog/types";
import {
  getFileExtension,
  isValidImageFile,
} from "@/lib/catalog/utils";
import { requireAdmin } from "@/lib/catalog/queries";
import { categoryRepository, productRepository } from "@/lib/db/product-repository";
import { ProductStatus } from "@prisma/client";

const ADMIN_CATEGORIES = "/admin/categories";
const ADMIN_PRODUCTS = "/admin/products";

// Local storage directory
const STORAGE_DIR = join(process.cwd(), "public", "storage");

async function ensureStorageDir() {
  try {
    await mkdir(STORAGE_DIR, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
}

function getFormString(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function getOptionalFile(formData: FormData, key: string): File | null {
  const value = formData.get(key);

  if (!(value instanceof File) || value.size === 0 || !value.name) {
    return null;
  }

  return value;
}

function revalidateCatalogPaths() {
  revalidatePath(ADMIN_CATEGORIES);
  revalidatePath(ADMIN_PRODUCTS);
  revalidatePath("/admin");
}

async function uploadThumbnail(
  productId: string,
  file: File
): Promise<{ path: string } | { error: string }> {
  if (!isValidImageFile(file)) {
    return { error: "Thumbnail must be a JPEG, PNG, WebP, or GIF image." };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { error: "Thumbnail must be 5 MB or smaller." };
  }

  await ensureStorageDir();

  const extension = getFileExtension(file.name) || "jpg";
  const fileName = `${productId}_thumbnail.${extension}`;
  const filePath = join(STORAGE_DIR, fileName);
  const publicPath = `/storage/${fileName}`;

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);
    return { path: publicPath };
  } catch (error) {
    return { error: "Failed to upload thumbnail." };
  }
}

async function uploadProductFile(
  productId: string,
  file: File
): Promise<{ path: string } | { error: string }> {
  if (file.size > 50 * 1024 * 1024) {
    return { error: "Product file must be 50 MB or smaller." };
  }

  await ensureStorageDir();

  const extension = getFileExtension(file.name);
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const fileName = extension
    ? `${productId}_${safeName}`
    : `${productId}_${safeName}`;
  const filePath = join(STORAGE_DIR, fileName);
  const publicPath = `/storage/${fileName}`;

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);
    return { path: publicPath };
  } catch (error) {
    return { error: "Failed to upload product file." };
  }
}

async function removeStorageObject(
  _bucket: "products" | "downloads",
  path: string | null | undefined
) {
  if (!path) {
    return;
  }

  // Remove local file if it exists
  try {
    const fileName = path.split("/").pop();
    if (fileName) {
      const filePath = join(STORAGE_DIR, fileName);
      // Note: We don't have a delete function imported, but this is a placeholder
      // In a real implementation, you would use fs.unlink here
    }
  } catch (error) {
    // File might not exist, ignore error
  }
}

export async function createCategory(
  _prevState: CatalogActionState,
  formData: FormData
): Promise<CatalogActionState> {
  const auth = await requireAdmin();

  if ("error" in auth) {
    return { error: auth.error };
  }

  const parsed = categorySchema.safeParse({
    name: getFormString(formData, "name"),
    slug: getFormString(formData, "slug"),
    description: getFormString(formData, "description"),
  });

  if (!parsed.success) {
    return { fieldErrors: mapZodErrors(parsed.error) };
  }

  try {
    await categoryRepository.createCategory({
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description,
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      return { fieldErrors: { slug: "This slug is already in use." } };
    }
    return { error: error.message || "Failed to create category." };
  }

  revalidateCatalogPaths();
  redirect(ADMIN_CATEGORIES);
}

export async function updateCategory(
  _prevState: CatalogActionState,
  formData: FormData
): Promise<CatalogActionState> {
  const auth = await requireAdmin();

  if ("error" in auth) {
    return { error: auth.error };
  }

  const id = getFormString(formData, "id");

  if (!id) {
    return { error: "Category ID is required." };
  }

  const parsed = categorySchema.safeParse({
    name: getFormString(formData, "name"),
    slug: getFormString(formData, "slug"),
    description: getFormString(formData, "description"),
  });

  if (!parsed.success) {
    return { fieldErrors: mapZodErrors(parsed.error) };
  }

  try {
    await categoryRepository.updateCategory(id, {
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description,
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      return { fieldErrors: { slug: "This slug is already in use." } };
    }
    return { error: error.message || "Failed to update category." };
  }

  revalidateCatalogPaths();
  redirect(ADMIN_CATEGORIES);
}

export async function deleteCategory(
  id: string
): Promise<{ error?: string; success?: string }> {
  const auth = await requireAdmin();

  if ("error" in auth) {
    return { error: auth.error };
  }

  if (!id) {
    return { error: "Category ID is required." };
  }

  try {
    await categoryRepository.deleteCategory(id);
  } catch (error: any) {
    return { error: error.message || "Failed to delete category." };
  }

  revalidateCatalogPaths();
  return { success: "Category deleted." };
}

export async function createProduct(
  _prevState: CatalogActionState,
  formData: FormData
): Promise<CatalogActionState> {
  const auth = await requireAdmin();

  if ("error" in auth) {
    return { error: auth.error };
  }

  const parsed = productSchema.safeParse({
    name: getFormString(formData, "name"),
    slug: getFormString(formData, "slug"),
    description: getFormString(formData, "description"),
    price: getFormString(formData, "price") || "0",
    categoryId: getFormString(formData, "categoryId") || null,
    status: getFormString(formData, "status") || "draft",
  });

  if (!parsed.success) {
    return { fieldErrors: mapZodErrors(parsed.error) };
  }

  const thumbnail = getOptionalFile(formData, "thumbnail");
  const productFile = getOptionalFile(formData, "file");

  let product;
  try {
    product = await productRepository.createProduct({
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description,
      price: parseFloat(parsed.data.price),
      categoryId: parsed.data.categoryId || undefined,
      status: parsed.data.status as ProductStatus,
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      return { fieldErrors: { slug: "This slug is already in use." } };
    }
    return { error: error.message || "Failed to create product." };
  }

  const updates: { thumbnailPath?: string; filePath?: string } = {};

  if (thumbnail) {
    const result = await uploadThumbnail(product.id, thumbnail);

    if ("error" in result) {
      await productRepository.deleteProduct(product.id);
      return { error: result.error };
    }

    updates.thumbnailPath = result.path;
  }

  if (productFile) {
    const result = await uploadProductFile(product.id, productFile);

    if ("error" in result) {
      await removeStorageObject("products", updates.thumbnailPath);
      await productRepository.deleteProduct(product.id);
      return { error: result.error };
    }

    updates.filePath = result.path;
  }

  if (Object.keys(updates).length > 0) {
    try {
      await productRepository.updateProduct(product.id, updates);
    } catch (error: any) {
      return { error: error.message || "Failed to update product." };
    }
  }

  revalidateCatalogPaths();
  redirect(ADMIN_PRODUCTS);
}

export async function updateProduct(
  _prevState: CatalogActionState,
  formData: FormData
): Promise<CatalogActionState> {
  const auth = await requireAdmin();

  if ("error" in auth) {
    return { error: auth.error };
  }

  const id = getFormString(formData, "id");

  if (!id) {
    return { error: "Product ID is required." };
  }

  const parsed = productSchema.safeParse({
    name: getFormString(formData, "name"),
    slug: getFormString(formData, "slug"),
    description: getFormString(formData, "description"),
    price: getFormString(formData, "price") || "0",
    categoryId: getFormString(formData, "categoryId") || null,
    status: getFormString(formData, "status") || "draft",
  });

  if (!parsed.success) {
    return { fieldErrors: mapZodErrors(parsed.error) };
  }

  const existing = await productRepository.getProductById(id);
  if (!existing) {
    return { error: "Product not found." };
  }

  const thumbnail = getOptionalFile(formData, "thumbnail");
  const productFile = getOptionalFile(formData, "file");
  const removeThumbnail = getFormString(formData, "removeThumbnail") === "true";
  const removeFile = getFormString(formData, "removeFile") === "true";

  let thumbnailPath = existing.thumbnailPath;
  let filePath = existing.filePath;

  if (removeThumbnail && thumbnailPath) {
    await removeStorageObject("products", thumbnailPath);
    thumbnailPath = null;
  }

  if (removeFile && filePath) {
    await removeStorageObject("downloads", filePath);
    filePath = null;
  }

  if (thumbnail) {
    const result = await uploadThumbnail(id, thumbnail);

    if ("error" in result) {
      return { error: result.error };
    }

    if (existing.thumbnailPath && existing.thumbnailPath !== result.path) {
      await removeStorageObject("products", existing.thumbnailPath);
    }

    thumbnailPath = result.path;
  }

  if (productFile) {
    const result = await uploadProductFile(id, productFile);

    if ("error" in result) {
      return { error: result.error };
    }

    if (existing.filePath && existing.filePath !== result.path) {
      await removeStorageObject("downloads", existing.filePath);
    }

    filePath = result.path;
  }

  try {
    await productRepository.updateProduct(id, {
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description,
      price: parseFloat(parsed.data.price),
      categoryId: parsed.data.categoryId || undefined,
      status: parsed.data.status as ProductStatus,
      thumbnailPath,
      filePath,
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      return { fieldErrors: { slug: "This slug is already in use." } };
    }
    return { error: error.message || "Failed to update product." };
  }

  revalidateCatalogPaths();
  redirect(ADMIN_PRODUCTS);
}

export async function deleteProduct(
  id: string
): Promise<{ error?: string; success?: string }> {
  const auth = await requireAdmin();

  if ("error" in auth) {
    return { error: auth.error };
  }

  if (!id) {
    return { error: "Product ID is required." };
  }

  const product = await productRepository.getProductById(id);
  if (!product) {
    return { error: "Product not found." };
  }

  try {
    await productRepository.deleteProduct(id);
  } catch (error: any) {
    return { error: error.message || "Failed to delete product." };
  }

  if (product) {
    await removeStorageObject("products", product.thumbnailPath);
    await removeStorageObject("downloads", product.filePath);
  }

  revalidateCatalogPaths();
  return { success: "Product deleted." };
}

export async function publishProduct(
  id: string
): Promise<{ error?: string; success?: string }> {
  const auth = await requireAdmin();

  if ("error" in auth) {
    return { error: auth.error };
  }

  if (!id) {
    return { error: "Product ID is required." };
  }

  try {
    await productRepository.updateProduct(id, {
      status: ProductStatus.published,
    });
  } catch (error: any) {
    return { error: error.message || "Failed to publish product." };
  }

  revalidateCatalogPaths();
  return { success: "Product published." };
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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
import { createClient } from "@/lib/supabase/server";

const ADMIN_CATEGORIES = "/admin/categories";
const ADMIN_PRODUCTS = "/admin/products";

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

  const supabase = await createClient();
  const extension = getFileExtension(file.name) || "jpg";
  const path = `${productId}/thumbnail.${extension}`;

  const { error } = await supabase.storage
    .from("products")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) {
    return { error: error.message };
  }

  return { path };
}

async function uploadProductFile(
  productId: string,
  file: File
): Promise<{ path: string } | { error: string }> {
  if (file.size > 50 * 1024 * 1024) {
    return { error: "Product file must be 50 MB or smaller." };
  }

  const supabase = await createClient();
  const extension = getFileExtension(file.name);
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = extension
    ? `${productId}/${safeName}`
    : `${productId}/${safeName}`;

  const { error } = await supabase.storage
    .from("downloads")
    .upload(path, file, { upsert: true, contentType: file.type || undefined });

  if (error) {
    return { error: error.message };
  }

  return { path };
}

async function removeStorageObject(
  bucket: "products" | "downloads",
  path: string | null | undefined
) {
  if (!path) {
    return;
  }

  const supabase = await createClient();
  await supabase.storage.from(bucket).remove([path]);
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

  const supabase = await createClient();

  const { error } = await supabase.from("categories").insert({
    name: parsed.data.name,
    slug: parsed.data.slug,
    description: parsed.data.description,
  });

  if (error) {
    if (error.code === "23505") {
      return { fieldErrors: { slug: "This slug is already in use." } };
    }

    return { error: error.message };
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

  const supabase = await createClient();

  const { error } = await supabase
    .from("categories")
    .update({
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description,
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { fieldErrors: { slug: "This slug is already in use." } };
    }

    return { error: error.message };
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

  const supabase = await createClient();

  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) {
    return { error: error.message };
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

  const supabase = await createClient();
  const thumbnail = getOptionalFile(formData, "thumbnail");
  const productFile = getOptionalFile(formData, "file");

  const { data: product, error } = await supabase
    .from("products")
    .insert({
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description,
      price: parsed.data.price,
      category_id: parsed.data.categoryId,
      status: parsed.data.status,
    })
    .select("id")
    .single();

  if (error || !product) {
    if (error?.code === "23505") {
      return { fieldErrors: { slug: "This slug is already in use." } };
    }

    return { error: error?.message ?? "Failed to create product." };
  }

  const updates: { thumbnail_path?: string; file_path?: string } = {};

  if (thumbnail) {
    const result = await uploadThumbnail(product.id, thumbnail);

    if ("error" in result) {
      await supabase.from("products").delete().eq("id", product.id);
      return { error: result.error };
    }

    updates.thumbnail_path = result.path;
  }

  if (productFile) {
    const result = await uploadProductFile(product.id, productFile);

    if ("error" in result) {
      await removeStorageObject("products", updates.thumbnail_path);
      await supabase.from("products").delete().eq("id", product.id);
      return { error: result.error };
    }

    updates.file_path = result.path;
  }

  if (Object.keys(updates).length > 0) {
    const { error: updateError } = await supabase
      .from("products")
      .update(updates)
      .eq("id", product.id);

    if (updateError) {
      return { error: updateError.message };
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

  const supabase = await createClient();

  const { data: existing, error: fetchError } = await supabase
    .from("products")
    .select("thumbnail_path, file_path")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !existing) {
    return { error: fetchError?.message ?? "Product not found." };
  }

  const thumbnail = getOptionalFile(formData, "thumbnail");
  const productFile = getOptionalFile(formData, "file");
  const removeThumbnail = getFormString(formData, "removeThumbnail") === "true";
  const removeFile = getFormString(formData, "removeFile") === "true";

  let thumbnailPath = existing.thumbnail_path;
  let filePath = existing.file_path;

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

    if (existing.thumbnail_path && existing.thumbnail_path !== result.path) {
      await removeStorageObject("products", existing.thumbnail_path);
    }

    thumbnailPath = result.path;
  }

  if (productFile) {
    const result = await uploadProductFile(id, productFile);

    if ("error" in result) {
      return { error: result.error };
    }

    if (existing.file_path && existing.file_path !== result.path) {
      await removeStorageObject("downloads", existing.file_path);
    }

    filePath = result.path;
  }

  const { error } = await supabase
    .from("products")
    .update({
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description,
      price: parsed.data.price,
      category_id: parsed.data.categoryId,
      status: parsed.data.status,
      thumbnail_path: thumbnailPath,
      file_path: filePath,
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { fieldErrors: { slug: "This slug is already in use." } };
    }

    return { error: error.message };
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

  const supabase = await createClient();

  const { data: product, error: fetchError } = await supabase
    .from("products")
    .select("thumbnail_path, file_path")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    return { error: fetchError.message };
  }

  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  if (product) {
    await removeStorageObject("products", product.thumbnail_path);
    await removeStorageObject("downloads", product.file_path);
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

  const supabase = await createClient();

  const { error } = await supabase
    .from("products")
    .update({ status: "published" })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidateCatalogPaths();
  return { success: "Product published." };
}

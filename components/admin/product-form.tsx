"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";

import { FormMessage } from "@/components/auth/form-message";
import { SubmitButton } from "@/components/auth/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createProduct,
  updateProduct,
} from "@/lib/catalog/actions";
import type { CatalogActionState } from "@/lib/catalog/types";
import { getStoragePublicUrl, slugify } from "@/lib/catalog/utils";
import type { Category, ProductWithCategory } from "@/lib/types";

const initialState: CatalogActionState = {};

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-destructive">{message}</p>;
}

export function ProductForm({
  categories,
  product,
}: {
  categories: Category[];
  product?: ProductWithCategory;
}) {
  const action = product ? updateProduct : createProduct;
  const [state, formAction] = useActionState(action, initialState);
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(product));
  const [status, setStatus] = useState(product?.status ?? "draft");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");
  const [removeThumbnail, setRemoveThumbnail] = useState(false);
  const [removeFile, setRemoveFile] = useState(false);
  const router = useRouter();

  const thumbnailUrl = getStoragePublicUrl("products", product?.thumbnailPath);

  useEffect(() => {
    if (!slugEdited) {
      setSlug(slugify(name));
    }
  }, [name, slugEdited]);

  return (
    <form action={formAction} className="max-w-2xl space-y-4">
      {product ? <input type="hidden" name="id" value={product.id} /> : null}
      <input type="hidden" name="status" value={status} />
      <input type="hidden" name="categoryId" value={categoryId} />
      <input type="hidden" name="removeThumbnail" value={String(removeThumbnail)} />
      <input type="hidden" name="removeFile" value={String(removeFile)} />

      <FormMessage error={state.error} success={state.success} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            aria-invalid={Boolean(state.fieldErrors?.name)}
          />
          <FieldError message={state.fieldErrors?.name} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            name="slug"
            value={slug}
            onChange={(event) => {
              setSlugEdited(true);
              setSlug(event.target.value);
            }}
            required
            aria-invalid={Boolean(state.fieldErrors?.slug)}
          />
          <FieldError message={state.fieldErrors?.slug} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="price">Price (USD)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={product?.price ?? 0}
            required
            aria-invalid={Boolean(state.fieldErrors?.price)}
          />
          <FieldError message={state.fieldErrors?.price} />
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={categoryId || "none"}
            onValueChange={(value) =>
              setCategoryId(value === "none" ? "" : value)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No category</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError message={state.fieldErrors?.categoryId} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Status</Label>
        <Select
          value={status}
          onValueChange={(value) => setStatus(value as "draft" | "published")}
        >
          <SelectTrigger className="w-full md:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
        <FieldError message={state.fieldErrors?.status} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={product?.description ?? ""}
          rows={6}
          aria-invalid={Boolean(state.fieldErrors?.description)}
        />
        <FieldError message={state.fieldErrors?.description} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="thumbnail">Thumbnail</Label>
        {thumbnailUrl && !removeThumbnail ? (
          <div className="flex items-center gap-4 rounded-lg border p-3">
            <Image
              src={thumbnailUrl}
              alt={`${product?.name ?? "Product"} thumbnail`}
              width={80}
              height={80}
              className="size-20 rounded-md object-cover"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRemoveThumbnail(true)}
            >
              Remove thumbnail
            </Button>
          </div>
        ) : (
          <Input
            id="thumbnail"
            name="thumbnail"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
          />
        )}
        <p className="text-xs text-muted-foreground">
          JPEG, PNG, WebP, or GIF. Max 5 MB.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="file">Product file</Label>
        {product?.filePath && !removeFile ? (
          <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
            <p className="truncate text-sm">{product.filePath.split("/").pop()}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRemoveFile(true)}
            >
              Remove file
            </Button>
          </div>
        ) : (
          <Input id="file" name="file" type="file" />
        )}
        <p className="text-xs text-muted-foreground">Max 50 MB.</p>
      </div>

      <div className="flex gap-2">
        <SubmitButton className="w-auto" pendingLabel="Saving...">
          {product ? "Save changes" : "Create product"}
        </SubmitButton>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function ProductFormLink({ href }: { href: string }) {
  return (
    <Button asChild>
      <Link href={href}>New product</Link>
    </Button>
  );
}

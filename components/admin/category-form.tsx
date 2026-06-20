"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";

import { FormMessage } from "@/components/auth/form-message";
import { SubmitButton } from "@/components/auth/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createCategory,
  updateCategory,
} from "@/lib/catalog/actions";
import type { CatalogActionState } from "@/lib/catalog/types";
import { slugify } from "@/lib/catalog/utils";
import type { Category } from "@/lib/types";

const initialState: CatalogActionState = {};

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-destructive">{message}</p>;
}

export function CategoryForm({ category }: { category?: Category }) {
  const action = category ? updateCategory : createCategory;
  const [state, formAction] = useActionState(action, initialState);
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(category));
  const router = useRouter();

  useEffect(() => {
    if (!slugEdited) {
      setSlug(slugify(name));
    }
  }, [name, slugEdited]);

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      {category ? <input type="hidden" name="id" value={category.id} /> : null}

      <FormMessage error={state.error} success={state.success} />

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

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={category?.description ?? ""}
          rows={4}
          aria-invalid={Boolean(state.fieldErrors?.description)}
        />
        <FieldError message={state.fieldErrors?.description} />
      </div>

      <div className="flex gap-2">
        <SubmitButton className="w-auto" pendingLabel="Saving...">
          {category ? "Save changes" : "Create category"}
        </SubmitButton>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function CategoryFormLink({ href }: { href: string }) {
  return (
    <Button asChild>
      <Link href={href}>New category</Link>
    </Button>
  );
}

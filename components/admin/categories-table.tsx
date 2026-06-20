"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Pencil } from "lucide-react";

import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteCategory } from "@/lib/catalog/actions";
import type { Category } from "@/lib/types";

export function CategoriesTable({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  function handleDelete(id: string) {
    return deleteCategory(id).then((result) => {
      if (!result.error) {
        startTransition(() => router.refresh());
      }
      return result;
    });
  }

  if (categories.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        No categories found.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Slug</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {categories.map((category) => (
          <TableRow key={category.id}>
            <TableCell className="font-medium">{category.name}</TableCell>
            <TableCell>
              <Badge variant="secondary">{category.slug}</Badge>
            </TableCell>
            <TableCell className="max-w-xs truncate text-muted-foreground">
              {category.description || "—"}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/categories/${category.id}/edit`}>
                    <Pencil className="size-4" />
                    Edit
                  </Link>
                </Button>
                <DeleteConfirmDialog
                  title="Delete category?"
                  description={`This will permanently delete "${category.name}". Products in this category will be uncategorized.`}
                  onConfirm={() => handleDelete(category.id)}
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

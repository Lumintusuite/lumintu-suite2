"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { Input } from "@/components/ui/input";

export function SearchInput({
  placeholder = "Search...",
  paramName = "q",
}: {
  placeholder?: string;
  paramName?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const defaultValue = searchParams.get(paramName) ?? "";

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = String(formData.get(paramName) ?? "").trim();
    const params = new URLSearchParams(searchParams.toString());

    if (query) {
      params.set(paramName, query);
    } else {
      params.delete(paramName);
    }

    params.delete("page");

    startTransition(() => {
      const qs = params.toString();
      router.push(qs ? `?${qs}` : "?");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        name={paramName}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="max-w-sm"
        disabled={isPending}
      />
      <button
        type="submit"
        className="inline-flex h-8 items-center rounded-lg border border-border bg-background px-3 text-sm font-medium hover:bg-muted disabled:opacity-50"
        disabled={isPending}
      >
        Search
      </button>
    </form>
  );
}

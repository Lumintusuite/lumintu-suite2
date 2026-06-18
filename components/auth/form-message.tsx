import { cn } from "@/lib/utils";

export function FormMessage({
  error,
  success,
  className,
}: {
  error?: string;
  success?: string;
  className?: string;
}) {
  if (!error && !success) {
    return null;
  }

  return (
    <div
      role="alert"
      className={cn(
        "rounded-lg border px-3 py-2 text-sm",
        error &&
          "border-destructive/30 bg-destructive/10 text-destructive",
        success && "border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
        className
      )}
    >
      {error ?? success}
    </div>
  );
}

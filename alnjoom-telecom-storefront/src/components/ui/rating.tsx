import { Star } from "lucide-react";

export function Rating({ value, count, label }: { value: number; count?: number; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-sm text-muted" aria-label={label}>
      <Star className="size-4 fill-accent text-accent" aria-hidden="true" />
      <bdi>{value.toFixed(1)}</bdi>
      {typeof count === "number" ? <span>({count})</span> : null}
    </span>
  );
}

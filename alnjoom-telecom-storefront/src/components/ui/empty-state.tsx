import { PackageOpen } from "lucide-react";

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="surface-card grid min-h-64 place-items-center p-8 text-center">
      <div className="max-w-md">
        <PackageOpen className="mx-auto mb-4 size-10 text-brand" aria-hidden="true" />
        <h2 className="text-xl font-bold">{title}</h2>
        {description ? <p className="mt-2 text-sm leading-7 text-muted">{description}</p> : null}
        {action ? <div className="mt-5">{action}</div> : null}
      </div>
    </div>
  );
}

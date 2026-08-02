import { CircleAlert, Info } from "lucide-react";
import clsx from "clsx";

export function Alert({ children, tone = "info", className }: { children: React.ReactNode; tone?: "info" | "error" | "success"; className?: string }) {
  return (
    <div role={tone === "error" ? "alert" : "status"} className={clsx("flex items-start gap-3 rounded-xl border p-4 text-sm", tone === "error" ? "border-red-200 bg-red-50 text-danger" : tone === "success" ? "border-emerald-200 bg-emerald-50 text-success" : "border-line bg-surface text-ink", className)}>
      {tone === "error" ? <CircleAlert className="mt-0.5 size-5 shrink-0" /> : <Info className="mt-0.5 size-5 shrink-0 text-brand" />}
      <div>{children}</div>
    </div>
  );
}

"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircle2, CircleAlert, X } from "lucide-react";

type ToastTone = "success" | "error" | "info";
interface ToastItem { id: number; message: string; tone: ToastTone }
interface ToastApi { show: (message: string, tone?: ToastTone) => void }

const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const show = useCallback((message: string, tone: ToastTone = "info") => {
    const id = Date.now() + Math.random();
    setItems((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => setItems((current) => current.filter((item) => item.id !== id)), 5000);
  }, []);
  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed inset-x-4 bottom-4 z-[100] flex flex-col items-end gap-2" aria-live="polite" aria-atomic="false">
        {items.map((item) => (
          <div key={item.id} role={item.tone === "error" ? "alert" : "status"} className="flex w-full max-w-md items-center gap-3 rounded-xl border border-line bg-white p-3 shadow-xl">
            {item.tone === "error" ? <CircleAlert className="size-5 text-danger" /> : <CheckCircle2 className="size-5 text-success" />}
            <span className="flex-1 text-sm">{item.message}</span>
            <button className="grid size-10 place-items-center rounded-lg" onClick={() => setItems((current) => current.filter((value) => value.id !== item.id))} aria-label="Dismiss">
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const value = useContext(ToastContext);
  if (!value) throw new Error("useToast must be used inside ToastProvider");
  return value;
}

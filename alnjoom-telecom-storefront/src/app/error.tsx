"use client";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) { useEffect(() => { if (process.env.NODE_ENV === "development") console.error(error); }, [error]); return <main id="main-content" className="container-shell section-space"><div className="surface-card p-10 text-center"><h1 className="text-2xl font-black">تعذّر تحميل الصفحة</h1><p className="mt-2 text-muted">The page could not be loaded.</p><Button className="mt-6" onClick={reset}>حاول مرة أخرى / Try again</Button></div></main>; }

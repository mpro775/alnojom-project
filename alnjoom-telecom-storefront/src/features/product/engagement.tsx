"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Locale } from "@/lib/api/contracts";
import { apiClient } from "@/lib/api/client";
import { ApiError, userSafeError } from "@/lib/api/error";
import { customerEndpoints, toCustomerBff } from "@/lib/api/endpoints";
import { localePath } from "@/lib/i18n/locales";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function ReviewForm({ productId, locale }: { productId: string; locale: Locale }) {
  const [busy, setBusy] = useState(false);
  const { show } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  return <form className="mt-6 grid gap-3 rounded-xl bg-surface p-4" onSubmit={async (event) => { event.preventDefault(); const form = new FormData(event.currentTarget); setBusy(true); try { await apiClient(toCustomerBff(customerEndpoints.reviews), { method: "POST", body: JSON.stringify({ productId, rating: Number(form.get("rating")), comment: String(form.get("comment") ?? "").trim() || undefined }) }); show(locale === "ar" ? "أرسل تقييمك للمراجعة" : "Your review was submitted for moderation", "success"); event.currentTarget.reset(); router.refresh(); } catch (error) { if (error instanceof ApiError && error.status === 401) router.push(`${localePath(locale, "/login")}?returnTo=${encodeURIComponent(pathname)}`); else show(userSafeError(error, locale), "error"); } finally { setBusy(false); } }}><h3 className="font-bold">{locale === "ar" ? "اكتب تقييمًا" : "Write a review"}</h3><label className="text-sm">{locale === "ar" ? "التقييم" : "Rating"}<select required name="rating" className="field mt-1"><option value="">—</option>{[5,4,3,2,1].map((rating) => <option key={rating} value={rating}>{rating} / 5</option>)}</select></label><label className="text-sm">{locale === "ar" ? "تعليقك" : "Comment"}<textarea name="comment" maxLength={1000} className="field mt-1 min-h-28" /></label><Button disabled={busy}>{locale === "ar" ? "إرسال التقييم" : "Submit review"}</Button></form>;
}

export function QuestionForm({ productId, locale }: { productId: string; locale: Locale }) {
  const [busy, setBusy] = useState(false);
  const { show } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  return <form className="mt-6 grid gap-3 rounded-xl bg-surface p-4" onSubmit={async (event) => { event.preventDefault(); const form = new FormData(event.currentTarget); setBusy(true); try { await apiClient(toCustomerBff(customerEndpoints.questions(productId)), { method: "POST", body: JSON.stringify({ question: String(form.get("question") ?? "").trim() }) }); show(locale === "ar" ? "أرسل سؤالك للمراجعة" : "Your question was submitted for moderation", "success"); event.currentTarget.reset(); } catch (error) { if (error instanceof ApiError && error.status === 401) router.push(`${localePath(locale, "/login")}?returnTo=${encodeURIComponent(pathname)}`); else show(userSafeError(error, locale), "error"); } finally { setBusy(false); } }}><h3 className="font-bold">{locale === "ar" ? "لديك سؤال؟" : "Have a question?"}</h3><textarea required name="question" minLength={3} maxLength={1000} className="field min-h-28" placeholder={locale === "ar" ? "اكتب سؤالك عن المنتج" : "Ask about this product"} /><p className="text-xs text-muted">{locale === "ar" ? "قد يحتاج السؤال إلى مراجعة قبل ظهوره." : "Questions may require moderation before appearing."}</p><Button disabled={busy}>{locale === "ar" ? "إرسال السؤال" : "Submit question"}</Button></form>;
}

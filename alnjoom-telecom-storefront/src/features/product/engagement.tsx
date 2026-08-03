"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Locale, Review, ProductQuestion } from "@/lib/api/contracts";
import { apiClient } from "@/lib/api/client";
import { ApiError, userSafeError } from "@/lib/api/error";
import { customerEndpoints, publicEndpoints, toCustomerBff } from "@/lib/api/endpoints";
import { localePath } from "@/lib/i18n/locales";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/format/commerce";

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

export function PaginatedReviews({ productId, locale, initialReviews, totalCount }: { productId: string; locale: Locale; initialReviews: Review[]; totalCount: number }) {
  const [items, setItems] = useState(initialReviews);
  const [busy, setBusy] = useState(false);
  const { show } = useToast();

  const loadMore = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const next = await apiClient<{ reviews: Review[] }>(`${toCustomerBff(publicEndpoints.productReviews(productId))}?limit=20&offset=${items.length}`);
      setItems([...items, ...next.reviews]);
    } catch (error) {
      show(userSafeError(error, locale), "error");
    } finally {
      setBusy(false);
    }
  };

  const hasMore = items.length < totalCount;

  return (
    <div className="space-y-3">
      {items.length ? (
        items.map((review) => (
          <article key={review.id} className="surface-card p-4">
            <div className="flex flex-wrap items-center gap-2">
              <strong>{review.customerName}</strong>
              <span className="text-accent">{"★".repeat(review.rating)}</span>
              {review.isVerifiedPurchase ? <span className="rounded bg-emerald-50 px-2 py-1 text-[11px] font-bold text-success">{locale === "ar" ? "شراء موثّق" : "Verified purchase"}</span> : null}
            </div>
            {review.comment ? <p className="mt-3 leading-7 text-muted">{review.comment}</p> : null}
            <time className="mt-3 block text-xs text-muted">{formatDate(review.createdAt, locale)}</time>
          </article>
        ))
      ) : (
        <p className="rounded-xl bg-surface p-6 text-muted">{locale === "ar" ? "لا توجد تقييمات منشورة بعد." : "No published reviews yet."}</p>
      )}
      {hasMore ? (
        <Button variant="secondary" className="w-full" disabled={busy} onClick={loadMore}>
          {locale === "ar" ? "تحميل المزيد" : "Load more"}
        </Button>
      ) : null}
    </div>
  );
}

export function PaginatedQuestions({ productId, locale, initialQuestions, totalCount }: { productId: string; locale: Locale; initialQuestions: ProductQuestion[]; totalCount: number }) {
  const [items, setItems] = useState(initialQuestions);
  const [busy, setBusy] = useState(false);
  const { show } = useToast();

  const loadMore = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const next = await apiClient<{ items: ProductQuestion[] }>(`${toCustomerBff(publicEndpoints.productQuestions(productId))}?limit=20&offset=${items.length}`);
      setItems([...items, ...next.items]);
    } catch (error) {
      show(userSafeError(error, locale), "error");
    } finally {
      setBusy(false);
    }
  };

  const hasMore = items.length < totalCount;

  return (
    <div className="space-y-3">
      {items.length ? (
        items.map((item) => (
          <article key={item.id} className="surface-card p-4">
            <p className="font-bold">{item.question}</p>
            {item.answer ? <p className="mt-3 border-s-4 border-accent ps-4 leading-7 text-muted">{item.answer}</p> : null}
          </article>
        ))
      ) : (
        <p className="rounded-xl bg-surface p-6 text-muted">{locale === "ar" ? "لا توجد أسئلة منشورة بعد." : "No published questions yet."}</p>
      )}
      {hasMore ? (
        <Button variant="secondary" className="w-full" disabled={busy} onClick={loadMore}>
          {locale === "ar" ? "تحميل المزيد" : "Load more"}
        </Button>
      ) : null}
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { Locale } from "@/lib/api/contracts";
import { apiClient } from "@/lib/api/client";
import { customerEndpoints, toAuthBff } from "@/lib/api/endpoints";
import { userSafeError } from "@/lib/api/error";
import { localePath, safeReturnTo } from "@/lib/i18n/locales";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export type AuthMode = "login" | "register" | "otp" | "forgot-password" | "reset-password";

export function AuthPage({ locale, mode }: { locale: Locale; mode: AuthMode }) {
  const router = useRouter();
  const query = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [otpRequested, setOtpRequested] = useState(false);
  const returnTo = safeReturnTo(query.get("returnTo"), locale);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    const data = new FormData(event.currentTarget);
    try {
      if (mode === "login") {
        await apiClient(toAuthBff(customerEndpoints.login), { method: "POST", body: JSON.stringify({ phoneOrEmail: String(data.get("identifier") ?? "").trim(), password: String(data.get("password") ?? "") }) });
        router.replace(returnTo);
        router.refresh();
      } else if (mode === "register") {
        const email = String(data.get("email") ?? "").trim();
        await apiClient(toAuthBff(customerEndpoints.register), { method: "POST", body: JSON.stringify({ fullName: String(data.get("fullName") ?? "").trim(), phone: String(data.get("phone") ?? "").trim(), ...(email ? { email } : {}), password: String(data.get("password") ?? "") }) });
        router.replace(returnTo);
        router.refresh();
      } else if (mode === "forgot-password") {
        await apiClient(toAuthBff(customerEndpoints.forgotPassword), { method: "POST", body: JSON.stringify({ email: String(data.get("email") ?? "").trim() }) });
        setMessage(locale === "ar" ? "إذا كان البريد مسجلًا فستصلك تعليمات الاستعادة." : "If the email exists, reset instructions will be sent.");
      } else if (mode === "reset-password") {
        await apiClient(toAuthBff(customerEndpoints.resetPassword), { method: "POST", body: JSON.stringify({ token: query.get("token") ?? "", password: String(data.get("password") ?? "") }) });
        setMessage(locale === "ar" ? "تم تحديث كلمة المرور. يمكنك تسجيل الدخول." : "Password updated. You can now sign in.");
      } else if (!otpRequested) {
        await apiClient(toAuthBff(customerEndpoints.otpRequest), { method: "POST", body: JSON.stringify({ identifier: String(data.get("identifier") ?? "").trim() }) });
        setOtpRequested(true);
        setMessage(locale === "ar" ? "أرسل رمز التحقق." : "Verification code sent.");
      } else {
        await apiClient(toAuthBff(customerEndpoints.otpVerify), { method: "POST", body: JSON.stringify({ identifier: String(data.get("identifier") ?? "").trim(), code: String(data.get("code") ?? "").trim() }) });
        router.replace(returnTo);
        router.refresh();
      }
    } catch (reason) {
      setError(userSafeError(reason, locale));
    } finally {
      setBusy(false);
    }
  }

  const title = titles[mode][locale];
  return (
    <main id="main-content" className="container-shell section-space">
      <div className="mx-auto max-w-md surface-card p-6 sm:p-8">
        <p className="text-sm font-bold text-brand">{locale === "ar" ? "حساب النجوم" : "Alnjoom account"}</p>
        <h1 className="mt-2 text-3xl font-black">{title}</h1>
        {message ? <Alert tone="success" className="mt-5">{message}</Alert> : null}
        {error ? <Alert tone="error" className="mt-5">{error}</Alert> : null}
        <form className="mt-6 space-y-4" onSubmit={submit}>
          {mode === "register" ? <><Field label={locale === "ar" ? "الاسم الكامل" : "Full name"} name="fullName" maxLength={120} /><Field label={locale === "ar" ? "رقم الهاتف" : "Phone"} name="phone" maxLength={30} inputMode="tel" /><Field label={locale === "ar" ? "البريد الإلكتروني (اختياري)" : "Email (optional)"} name="email" type="email" maxLength={120} required={false} /></> : null}
          {mode === "login" || mode === "otp" ? <Field label={mode === "login" ? locale === "ar" ? "الهاتف أو البريد" : "Phone or email" : locale === "ar" ? "الهاتف أو البريد" : "Phone or email"} name="identifier" maxLength={120} /> : null}
          {mode === "forgot-password" ? <Field label={locale === "ar" ? "البريد الإلكتروني" : "Email"} name="email" type="email" maxLength={120} /> : null}
          {mode === "login" || mode === "register" || mode === "reset-password" ? <Field label={locale === "ar" ? "كلمة المرور" : "Password"} name="password" type="password" minLength={8} maxLength={72} autoComplete={mode === "login" ? "current-password" : "new-password"} /> : null}
          {mode === "otp" && otpRequested ? <Field label={locale === "ar" ? "رمز التحقق" : "Verification code"} name="code" minLength={4} maxLength={6} inputMode="numeric" /> : null}
          {mode === "reset-password" && !query.get("token") ? <Alert tone="error">{locale === "ar" ? "رابط الاستعادة غير مكتمل." : "The reset link is incomplete."}</Alert> : null}
          <Button className="w-full" disabled={busy || (mode === "reset-password" && !query.get("token"))}>{busy ? locale === "ar" ? "جارٍ الإرسال…" : "Submitting…" : mode === "otp" && !otpRequested ? locale === "ar" ? "إرسال الرمز" : "Send code" : title}</Button>
        </form>
        <div className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-muted">{mode !== "login" ? <Link className="font-bold text-brand" href={localePath(locale, "/login")}>{locale === "ar" ? "تسجيل الدخول" : "Sign in"}</Link> : <><Link className="font-bold text-brand" href={localePath(locale, "/register")}>{locale === "ar" ? "إنشاء حساب" : "Create account"}</Link><Link href={localePath(locale, "/forgot-password")}>{locale === "ar" ? "نسيت كلمة المرور؟" : "Forgot password?"}</Link><Link href={localePath(locale, "/otp")}>{locale === "ar" ? "الدخول برمز تحقق" : "Sign in with OTP"}</Link></>}</div>
      </div>
    </main>
  );
}

function Field({ label, name, required = true, ...input }: { label: string; name: string; required?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return <label className="block text-sm font-bold">{label}<input className="field mt-1.5" name={name} required={required} {...input} /></label>;
}

const titles: Record<AuthMode, Record<Locale, string>> = {
  login: { ar: "تسجيل الدخول", en: "Sign in" },
  register: { ar: "إنشاء حساب", en: "Create account" },
  otp: { ar: "الدخول برمز تحقق", en: "OTP sign in" },
  "forgot-password": { ar: "استعادة كلمة المرور", en: "Reset password" },
  "reset-password": { ar: "تعيين كلمة مرور جديدة", en: "Set a new password" },
};

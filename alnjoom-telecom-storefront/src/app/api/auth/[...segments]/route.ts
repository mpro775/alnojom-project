import { NextRequest, NextResponse } from "next/server";
import type { CustomerAuthResult } from "@/lib/api/contracts";
import { customerEndpoints } from "@/lib/api/endpoints";
import { callBackend, fetchWithCustomerSession, proxyResponse } from "@/lib/auth/backend-session";
import { REFRESH_COOKIE, clearSessionCookies, setSessionCookies } from "@/lib/auth/cookies";
import { isSameOriginMutation, sanitizeSegments } from "@/lib/auth/route-security";

const authActions: Record<string, { path: string; method: "POST"; createsSession?: boolean }> = {
  register: { path: customerEndpoints.register, method: "POST", createsSession: true },
  login: { path: customerEndpoints.login, method: "POST", createsSession: true },
  "forgot-password": { path: customerEndpoints.forgotPassword, method: "POST" },
  "reset-password": { path: customerEndpoints.resetPassword, method: "POST" },
  "otp/request": { path: customerEndpoints.otpRequest, method: "POST" },
  "otp/verify": { path: customerEndpoints.otpVerify, method: "POST", createsSession: true },
  "otp/resend": { path: customerEndpoints.otpResend, method: "POST" },
};

type Context = { params: Promise<{ segments: string[] }> };

export async function GET(request: NextRequest, context: Context) {
  const segments = sanitizeSegments((await context.params).segments);
  if (!segments || segments.join("/") !== "session") return notFound();
  const result = await fetchWithCustomerSession(request, customerEndpoints.me, { method: "GET" });
  return proxyResponse(result.backend, result.refreshed);
}

export async function POST(request: NextRequest, context: Context) {
  if (!isSameOriginMutation(request)) return forbidden();
  const segments = sanitizeSegments((await context.params).segments);
  if (!segments) return notFound();
  const action = segments.join("/");

  if (action === "logout") {
    const result = await fetchWithCustomerSession(request, customerEndpoints.logout, { method: "POST" });
    const response = await proxyResponse(result.backend);
    clearSessionCookies(response);
    return response;
  }

  if (action === "refresh") {
    const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
    if (!refreshToken) return unauthorized();
    const backend = await callBackend(customerEndpoints.refresh, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!backend.ok) {
      const response = await proxyResponse(backend);
      clearSessionCookies(response);
      return response;
    }
    const session = (await backend.json()) as CustomerAuthResult;
    const response = NextResponse.json({ customer: session.customer }, { status: 200 });
    setSessionCookies(response, session.accessToken, session.refreshToken);
    return response;
  }

  const definition = authActions[action];
  if (!definition) return notFound();
  const body = await request.text();
  const backend = await callBackend(definition.path, {
    method: definition.method,
    headers: { "Content-Type": request.headers.get("content-type") ?? "application/json" },
    body,
  });
  if (!definition.createsSession || !backend.ok) return proxyResponse(backend);

  const session = (await backend.json()) as CustomerAuthResult;
  const response = NextResponse.json({ customer: session.customer }, { status: backend.status });
  setSessionCookies(response, session.accessToken, session.refreshToken);
  return response;
}

function notFound() {
  return NextResponse.json({ code: "ROUTE_NOT_ALLOWED", message: "Route not allowed" }, { status: 404 });
}

function forbidden() {
  return NextResponse.json({ code: "CSRF_REJECTED", message: "Cross-origin mutation rejected" }, { status: 403 });
}

function unauthorized() {
  return NextResponse.json({ code: "SESSION_REQUIRED", message: "Session required" }, { status: 401 });
}

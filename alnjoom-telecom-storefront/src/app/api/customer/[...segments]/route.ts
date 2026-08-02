import { NextRequest, NextResponse } from "next/server";
import { fetchWithCustomerSession, proxyResponse } from "@/lib/auth/backend-session";
import { isSameOriginMutation, sanitizeSegments } from "@/lib/auth/route-security";

type Context = { params: Promise<{ segments: string[] }> };

const uuid = "[0-9a-fA-F-]{36}";
const rules: Array<{ method: string; pattern: RegExp }> = [
  { method: "GET", pattern: /^me$/ },
  { method: "PATCH", pattern: /^me$/ },
  { method: "DELETE", pattern: /^me$/ },
  { method: "GET", pattern: /^addresses$/ },
  { method: "POST", pattern: /^addresses$/ },
  { method: "DELETE", pattern: new RegExp(`^addresses/${uuid}$`) },
  { method: "GET", pattern: /^wishlist$/ },
  { method: "POST", pattern: new RegExp(`^wishlist/${uuid}$`) },
  { method: "DELETE", pattern: new RegExp(`^wishlist/${uuid}$`) },
  { method: "GET", pattern: new RegExp(`^wishlist/${uuid}/check$`) },
  { method: "GET", pattern: /^reviews$/ },
  { method: "POST", pattern: /^reviews$/ },
  { method: "PATCH", pattern: new RegExp(`^reviews/${uuid}$`) },
  { method: "DELETE", pattern: new RegExp(`^reviews/${uuid}$`) },
  { method: "POST", pattern: new RegExp(`^products/${uuid}/questions$`) },
  { method: "POST", pattern: new RegExp(`^products/${uuid}/restock-subscriptions$`) },
  { method: "GET", pattern: /^orders$/ },
  { method: "GET", pattern: /^loyalty\/(wallet|ledger)$/ },
  { method: "GET", pattern: /^notifications\/(inbox|unread-count)$/ },
  { method: "PATCH", pattern: new RegExp(`^notifications/${uuid}/read$`) },
  { method: "PATCH", pattern: /^notifications\/read-all$/ },
  { method: "GET", pattern: /^support\/tickets$/ },
  { method: "POST", pattern: /^support\/tickets$/ },
  { method: "GET", pattern: new RegExp(`^support/tickets/${uuid}$`) },
  { method: "POST", pattern: new RegExp(`^support/tickets/${uuid}/messages$`) },
  { method: "PATCH", pattern: new RegExp(`^support/tickets/${uuid}/status$`) },
];

async function handle(request: NextRequest, context: Context) {
  if (!isSameOriginMutation(request)) {
    return NextResponse.json({ code: "CSRF_REJECTED", message: "Cross-origin mutation rejected" }, { status: 403 });
  }
  const segments = sanitizeSegments((await context.params).segments);
  if (!segments) return rejected();
  const relative = segments.join("/");
  if (!rules.some((rule) => rule.method === request.method && rule.pattern.test(relative))) return rejected();

  const target = `/customers/${relative}${request.nextUrl.search}`;
  const body = ["GET", "HEAD"].includes(request.method) ? undefined : await request.arrayBuffer();
  const init: RequestInit = {
    method: request.method,
    ...(body ? { body } : {}),
    headers: request.headers.get("content-type")
      ? { "Content-Type": request.headers.get("content-type") as string }
      : {},
  };
  const result = await fetchWithCustomerSession(request, target, init);
  return proxyResponse(result.backend, result.refreshed);
}

function rejected() {
  return NextResponse.json({ code: "ROUTE_NOT_ALLOWED", message: "Route not allowed" }, { status: 404 });
}

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const DELETE = handle;

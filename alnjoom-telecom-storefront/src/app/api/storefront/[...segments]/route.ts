import { NextRequest, NextResponse } from "next/server";
import { callBackend, proxyResponse } from "@/lib/auth/backend-session";
import { ACCESS_COOKIE } from "@/lib/auth/cookies";
import { isSameOriginMutation, sanitizeSegments } from "@/lib/auth/route-security";

type Context = { params: Promise<{ segments: string[] }> };
const uuid = "[0-9a-fA-F-]{36}";
const rules: Array<{ method: string; pattern: RegExp }> = [
  { method: "POST", pattern: /^events$/ },
  { method: "POST", pattern: /^cart\/items$/ },
  { method: "GET", pattern: new RegExp(`^cart/${uuid}$`) },
  { method: "PUT", pattern: new RegExp(`^cart/${uuid}/items/${uuid}$`) },
  { method: "DELETE", pattern: new RegExp(`^cart/${uuid}/items/${uuid}$`) },
  { method: "GET", pattern: /^products$/ },
  { method: "GET", pattern: /^products\/[^/]+$/ },
  { method: "GET", pattern: /^fulfillment-options$/ },
  { method: "GET", pattern: /^shipping-zones$/ },
  { method: "GET", pattern: /^payment-methods$/ },
  { method: "POST", pattern: /^payment-receipts(?:\/presign)?$/ },
  { method: "POST", pattern: /^checkout\/(quote|summary)$/ },
  { method: "POST", pattern: /^checkout$/ },
  { method: "GET", pattern: /^orders\/[^/]+\/track$/ },
];

async function handle(request: NextRequest, context: Context) {
  if (!isSameOriginMutation(request)) {
    return NextResponse.json({ code: "CSRF_REJECTED", message: "Cross-origin mutation rejected" }, { status: 403 });
  }
  const segments = sanitizeSegments((await context.params).segments);
  if (!segments) return rejected();
  const relative = segments.join("/");
  if (!rules.some((rule) => rule.method === request.method && rule.pattern.test(relative))) return rejected();

  const headers: Record<string, string> = {};
  const contentType = request.headers.get("content-type");
  if (contentType) headers["Content-Type"] = contentType;
  if (relative === "checkout") {
    const key = request.headers.get("idempotency-key")?.trim();
    if (!key || key.length < 16 || key.length > 200) {
      return NextResponse.json(
        { code: "IDEMPOTENCY_KEY_INVALID", message: "A valid Idempotency-Key is required" },
        { status: 400 },
      );
    }
    headers["Idempotency-Key"] = key;
  }

  let body: BodyInit | undefined;
  if (!["GET", "HEAD"].includes(request.method)) {
    if (relative === "checkout" || relative.startsWith("checkout/")) {
      const parsed = (await request.json()) as Record<string, unknown>;
      delete parsed.customerAccessToken;
      const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
      if (accessToken) parsed.customerAccessToken = accessToken;
      body = JSON.stringify(parsed);
      headers["Content-Type"] = "application/json";
    } else {
      body = await request.arrayBuffer();
    }
  }

  const backend = await callBackend(`/app/${relative}${request.nextUrl.search}`, {
    method: request.method,
    headers,
    ...(body ? { body } : {}),
  });
  return proxyResponse(backend);
}

function rejected() {
  return NextResponse.json({ code: "ROUTE_NOT_ALLOWED", message: "Route not allowed" }, { status: 404 });
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const DELETE = handle;

import type { NextRequest } from "next/server";

export function isSameOriginMutation(request: NextRequest): boolean {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return true;
  if (request.headers.get("x-requested-with") !== "AlnjoomStorefront") return false;
  const origin = request.headers.get("origin");
  if (!origin) return request.headers.get("sec-fetch-site") === "same-origin";
  try {
    return new URL(origin).host === request.nextUrl.host;
  } catch {
    return false;
  }
}

export function sanitizeSegments(segments: string[]): string[] | null {
  if (segments.some((segment) => !segment || segment === "." || segment === ".." || /[\\/\r\n]/.test(segment))) {
    return null;
  }
  return segments;
}

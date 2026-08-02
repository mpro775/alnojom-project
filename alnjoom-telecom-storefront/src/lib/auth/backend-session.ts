import "server-only";

import { NextRequest, NextResponse } from "next/server";
import type { CustomerAuthResult } from "@/lib/api/contracts";
import { customerEndpoints } from "@/lib/api/endpoints";
import { backendUrl } from "@/lib/api/server-client";
import { ACCESS_COOKIE, REFRESH_COOKIE, clearSessionCookies, setSessionCookies } from "./cookies";

export async function fetchWithCustomerSession(
  request: NextRequest,
  path: string,
  init: RequestInit,
): Promise<{ backend: Response; refreshed: CustomerAuthResult | null }> {
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const response = await callBackend(path, init, accessToken);
  if (response.status !== 401) return { backend: response, refreshed: null };

  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) return { backend: response, refreshed: null };
  const refreshResponse = await callBackend(customerEndpoints.refresh, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!refreshResponse.ok) return { backend: response, refreshed: null };

  const refreshed = (await refreshResponse.json()) as CustomerAuthResult;
  return {
    backend: await callBackend(path, init, refreshed.accessToken),
    refreshed,
  };
}

export async function callBackend(path: string, init: RequestInit = {}, accessToken?: string) {
  return fetch(backendUrl(path), {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...init.headers,
    },
  });
}

export async function proxyResponse(
  backend: Response,
  refreshed: CustomerAuthResult | null = null,
): Promise<NextResponse> {
  const body = backend.status === 204 ? null : await backend.arrayBuffer();
  const response = new NextResponse(body, {
    status: backend.status,
    headers: {
      "Content-Type": backend.headers.get("content-type") ?? "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
  if (refreshed) setSessionCookies(response, refreshed.accessToken, refreshed.refreshToken);
  if (backend.status === 401 && !refreshed) clearSessionCookies(response);
  return response;
}

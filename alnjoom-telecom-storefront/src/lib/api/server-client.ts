import "server-only";

import { ApiError } from "./error";

function backendOrigin(): string {
  const configured = process.env.BACKEND_API_URL?.trim();
  if (!configured) throw new ApiError({ message: "BACKEND_API_URL is not configured", kind: "network" });
  return configured.endsWith("/") ? configured : `${configured}/`;
}

export async function backendFetch<T>(
  path: string,
  init: RequestInit & { revalidate?: number | false } = {},
): Promise<T> {
  const { revalidate = false, ...requestInit } = init;
  let response: Response;
  try {
    const headers = new Headers(requestInit.headers);
    headers.set("Accept", "application/json");
    const options = {
      ...requestInit,
      headers,
      ...(revalidate === false ? { cache: "no-store" as const } : { next: { revalidate } }),
    };
    response = await fetch(new URL(path.replace(/^\//, ""), backendOrigin()), options);
  } catch (error) {
    throw ApiError.network(error);
  }
  if (!response.ok) throw await ApiError.fromResponse(response);
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export function backendUrl(path: string): URL {
  return new URL(path.replace(/^\//, ""), backendOrigin());
}

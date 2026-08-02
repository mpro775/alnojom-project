export function isAllowedRemoteImage(src: string | null | undefined): src is string {
  if (!src) return false;
  if (src.startsWith("/")) return true;
  try {
    const url = new URL(src);
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;
    const configured = process.env.NEXT_PUBLIC_MEDIA_HOST?.trim();
    if (!configured) return url.hostname === "media.zid.store";
    const allowed = configured.includes("://") ? new URL(configured).hostname : configured.split("/")[0];
    return url.hostname === allowed || url.hostname === "media.zid.store";
  } catch {
    return false;
  }
}

export function safeExternalUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function safeYoutubeEmbed(value: string | null | undefined): string | null {
  const safe = safeExternalUrl(value);
  if (!safe) return null;
  const url = new URL(safe);
  let id: string | null = null;
  if (url.hostname === "youtu.be") id = url.pathname.split("/").filter(Boolean)[0] ?? null;
  if (url.hostname === "www.youtube.com" || url.hostname === "youtube.com") {
    id = url.searchParams.get("v") ?? (url.pathname.startsWith("/shorts/") ? url.pathname.split("/")[2] ?? null : null);
  }
  return id && /^[\w-]{6,20}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
}

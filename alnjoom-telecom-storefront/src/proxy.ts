import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/ar" || pathname.startsWith("/ar/")) {
    const target = request.nextUrl.clone();
    target.pathname = pathname === "/ar" ? "/" : pathname.slice(3);
    return NextResponse.redirect(target, 308);
  }

  const locale = pathname === "/en" || pathname.startsWith("/en/") ? "en" : "ar";
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-storefront-locale", locale);

  if (locale === "en") {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const target = request.nextUrl.clone();
  target.pathname = pathname === "/" ? "/ar" : `/ar${pathname}`;
  return NextResponse.rewrite(target, { request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon.png|robots.txt|sitemap.xml|.*\\..*).*)"],
};

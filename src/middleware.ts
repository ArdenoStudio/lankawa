import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/v1/")) {
    const ip = getClientIp(request);
    const result = checkRateLimit(`api:${ip}`);
    const headers = rateLimitHeaders(result);

    if (!result.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded", retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000) },
        { status: 429, headers },
      );
    }

    const response = NextResponse.next();
    for (const [key, value] of Object.entries(headers)) {
      response.headers.set(key, value);
    }
    return response;
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/", "/(en|si|ta)/:path*", "/api/v1/:path*"],
};

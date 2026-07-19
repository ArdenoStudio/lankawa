import { createHash } from "crypto";
import { NextResponse } from "next/server";

export function jsonWithCache(
  body: unknown,
  options: {
    maxAge?: number;
    staleWhileRevalidate?: number;
    request?: Request;
  } = {},
): NextResponse {
  const maxAge = options.maxAge ?? 3600;
  const staleWhileRevalidate = options.staleWhileRevalidate ?? 86400;
  const serialized = JSON.stringify(body);
  const etag = `"${createHash("sha256").update(serialized).digest("hex").slice(0, 16)}"`;

  if (options.request) {
    const ifNoneMatch = options.request.headers.get("if-none-match");
    if (ifNoneMatch === etag) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          ETag: etag,
          "Cache-Control": `public, max-age=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
        },
      });
    }
  }

  return new NextResponse(serialized, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ETag: etag,
      "Cache-Control": `public, max-age=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
    },
  });
}

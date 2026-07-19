import { NextRequest, NextResponse } from "next/server";
import type { RetentionEvent, RetentionEventName } from "@/lib/analytics";

export const dynamic = "force-dynamic";

const ALLOWED: RetentionEventName[] = [
  "home_view",
  "home_return_d1",
  "home_return_d7",
  "today_metric_open",
  "brief_view",
];

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const candidate = body as Partial<RetentionEvent>;
  if (!candidate.name || !ALLOWED.includes(candidate.name as RetentionEventName)) {
    return NextResponse.json({ error: "Unsupported event" }, { status: 400 });
  }

  const event: RetentionEvent = {
    name: candidate.name as RetentionEventName,
    at: candidate.at ?? new Date().toISOString(),
    locale: typeof candidate.locale === "string" ? candidate.locale : undefined,
    path: typeof candidate.path === "string" ? candidate.path : undefined,
    meta: candidate.meta,
  };

  // Privacy-preserving: no cookies, no PII. Structured log for ops / future warehouse.
  console.info("[retention]", JSON.stringify(event));

  return NextResponse.json({ ok: true });
}

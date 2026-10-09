import { NextRequest, NextResponse } from "next/server";
import { confirmBriefSubscriber } from "@/lib/brief-subscribers";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")?.trim() ?? "";

  if (!token) {
    return NextResponse.json({ ok: false, error: "Missing token" }, { status: 400 });
  }

  // Pre-launch P6: confirm tokens are randomBytes(24).hex (48 hex chars).
  // Reject anything else before it reaches the database.
  if (!/^[0-9a-f]{48}$/.test(token)) {
    return NextResponse.json({ ok: false, error: "Invalid token" }, { status: 400 });
  }

  const result = await confirmBriefSubscriber(token);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }

  const rawLocale = request.nextUrl.searchParams.get("locale") ?? "en";
  const locale =
    rawLocale === "en" || rawLocale === "si" || rawLocale === "ta"
      ? rawLocale
      : "en";
  return NextResponse.redirect(new URL(`/${locale}?brief=confirmed`, request.url));
}

import { NextRequest, NextResponse } from "next/server";
import { confirmBriefSubscriber } from "@/lib/brief-subscribers";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")?.trim() ?? "";

  if (!token) {
    return NextResponse.json({ ok: false, error: "Missing token" }, { status: 400 });
  }

  const result = await confirmBriefSubscriber(token);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }

  const locale = request.nextUrl.searchParams.get("locale") ?? "en";
  return NextResponse.redirect(new URL(`/${locale}?brief=confirmed`, request.url));
}

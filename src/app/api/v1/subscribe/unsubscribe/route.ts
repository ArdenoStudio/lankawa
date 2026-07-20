import { NextRequest, NextResponse } from "next/server";
import { unsubscribeBriefSubscriber } from "@/lib/brief-subscribers";

async function readUnsubscribeInput(request: NextRequest): Promise<{
  token: string;
  email?: string;
  locale: string;
}> {
  const fromQuery = {
    token: request.nextUrl.searchParams.get("token")?.trim() ?? "",
    email: request.nextUrl.searchParams.get("email")?.trim() || undefined,
    locale: request.nextUrl.searchParams.get("locale")?.trim() || "en",
  };

  if (request.method === "GET") {
    return fromQuery;
  }

  try {
    const body = (await request.json()) as {
      token?: string;
      email?: string;
      locale?: string;
    };
    return {
      token: body.token?.trim() || fromQuery.token,
      email: body.email?.trim() || fromQuery.email,
      locale: body.locale?.trim() || fromQuery.locale || "en",
    };
  } catch {
    return fromQuery;
  }
}

async function run(request: NextRequest) {
  const input = await readUnsubscribeInput(request);

  if (!input.token) {
    return NextResponse.json(
      { ok: false, error: "Missing token" },
      { status: 400 },
    );
  }

  const result = await unsubscribeBriefSubscriber({
    token: input.token,
    email: input.email,
  });

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: 400 },
    );
  }

  const locale = ["en", "si", "ta"].includes(input.locale)
    ? input.locale
    : "en";

  if (request.method === "GET") {
    return NextResponse.redirect(
      new URL(`/${locale}/unsubscribe?done=1`, request.url),
    );
  }

  return NextResponse.json({ ok: true });
}

export async function GET(request: NextRequest) {
  return run(request);
}

export async function POST(request: NextRequest) {
  return run(request);
}

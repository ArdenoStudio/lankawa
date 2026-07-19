import { NextResponse } from "next/server";
import {
  sendResendEmail,
  upsertBriefSubscriber,
} from "@/lib/brief-subscribers";

export async function POST(request: Request) {
  let body: { email?: string; locale?: string };

  try {
    body = (await request.json()) as { email?: string; locale?: string };
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const email = body.email?.trim() ?? "";
  const locale = body.locale?.trim() ?? "en";
  const result = await upsertBriefSubscriber({ email, locale });

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: result.error.includes("Supabase") ? 503 : 400 },
    );
  }

  const origin = new URL(request.url).origin;
  const confirmUrl = `${origin}/api/v1/subscribe/confirm?token=${result.confirmToken}`;

  const mail = await sendResendEmail({
    to: email,
    subject: "Confirm your Lankawa morning brief",
    text: [
      "Confirm your Lankawa morning brief subscription:",
      confirmUrl,
      "",
      "If you did not request this, ignore this email.",
      "Lankawa does not sell email addresses.",
    ].join("\n"),
  });

  if (!mail.ok) {
    // Still accept the subscription row; ops can confirm manually / retry mailer.
    return NextResponse.json({
      ok: true,
      message:
        "Subscription recorded. Confirmation email could not be sent yet — check RESEND_API_KEY or ask an operator to confirm.",
      mailerConfigured: false,
    });
  }

  return NextResponse.json({
    ok: true,
    message: "Check your email to confirm the morning brief.",
    mailerConfigured: true,
  });
}

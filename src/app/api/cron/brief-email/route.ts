import { NextRequest, NextResponse } from "next/server";
import {
  listConfirmedSubscribers,
  markSubscriberSent,
  sendResendEmail,
} from "@/lib/brief-subscribers";
import { buildMorningBrief } from "@/lib/integrations/brief";

const DAILY_CAP = 200;

function authorize(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const header = request.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

async function run(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscribers = (await listConfirmedSubscribers(DAILY_CAP)).slice(
    0,
    DAILY_CAP,
  );

  if (subscribers.length === 0) {
    return NextResponse.json({
      ok: true,
      sent: 0,
      skipped: 0,
      note: "No confirmed subscribers",
    });
  }

  let sent = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const subscriber of subscribers) {
    if (subscriber.lastSentAt) {
      const last = new Date(subscriber.lastSentAt).getTime();
      if (Date.now() - last < 20 * 60 * 60 * 1000) {
        skipped += 1;
        continue;
      }
    }

    try {
      const brief = await buildMorningBrief(subscriber.locale);
      const text = [
        `Lankawa morning brief (${subscriber.locale})`,
        `Quality: ${brief.quality}`,
        "",
        ...brief.bullets.map((item) => `• ${item}`),
        "",
        `Topics: ${brief.topics.join(", ") || "n/a"}`,
        "https://lankawa.lk",
        "Unsubscribe: reply stop or contact the operators.",
      ].join("\n");

      const mail = await sendResendEmail({
        to: subscriber.email,
        subject: `Lankawa morning brief (${brief.locale})`,
        text,
      });

      if (!mail.ok) {
        errors.push(`${subscriber.email}: ${mail.error}`);
        continue;
      }

      await markSubscriberSent(subscriber.id);
      sent += 1;
    } catch (error) {
      errors.push(
        `${subscriber.email}: ${error instanceof Error ? error.message : "failed"}`,
      );
    }
  }

  return NextResponse.json({
    ok: errors.length === 0,
    sent,
    skipped,
    errors: errors.slice(0, 10),
  });
}

export async function GET(request: NextRequest) {
  return run(request);
}

export async function POST(request: NextRequest) {
  return run(request);
}

import { NextRequest, NextResponse } from "next/server";
import { answerQuestion } from "@/lib/assistant";
import { getDistrict } from "@/lib/districts";
import {
  checkAssistantDailyUsage,
} from "@/lib/assistant-usage";

export const dynamic = "force-dynamic";

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: NextRequest) {
  let body: { question?: string; districtSlug?: string };
  try {
    body = (await request.json()) as {
      question?: string;
      districtSlug?: string;
    };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const question = body.question?.trim();
  if (!question) {
    return NextResponse.json({ error: "question is required" }, { status: 400 });
  }
  if (question.length > 1000) {
    return NextResponse.json(
      { error: "question must be at most 1000 characters" },
      { status: 400 },
    );
  }

  const districtSlug = body.districtSlug?.trim() || null;
  if (districtSlug && !getDistrict(districtSlug)) {
    return NextResponse.json(
      { error: "Unknown districtSlug" },
      { status: 400 },
    );
  }

  // Pre-launch P7: daily per-caller cap on the usage-billed LLM endpoint.
  // Only counted when an OpenAI key is configured (no key = no spend).
  // Fails closed with a clear 429 once the daily budget is exhausted.
  if (process.env.OPENAI_API_KEY) {
    const usage = checkAssistantDailyUsage(`assistant:${getClientIp(request)}`);
    if (!usage.allowed) {
      return NextResponse.json(
        {
          error: `Daily assistant usage limit reached (${usage.limit} questions per day). Please try again tomorrow.`,
          retryAfter: usage.resetAt - Math.ceil(Date.now() / 1000),
        },
        {
          status: 429,
          headers: {
            "X-Assistant-Limit": String(usage.limit),
            "X-Assistant-Remaining": "0",
            "X-Assistant-Reset": String(usage.resetAt),
          },
        },
      );
    }
  }

  const result = await answerQuestion(question, { districtSlug });
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    question,
    districtSlug: result.districtSlug ?? districtSlug,
    ...result,
  });
}

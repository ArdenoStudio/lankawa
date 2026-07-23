import { NextRequest, NextResponse } from "next/server";
import { answerQuestion } from "@/lib/assistant";
import { getDistrict } from "@/lib/districts";

export const dynamic = "force-dynamic";

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

  const result = await answerQuestion(question, { districtSlug });
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    question,
    districtSlug: result.districtSlug ?? districtSlug,
    ...result,
  });
}

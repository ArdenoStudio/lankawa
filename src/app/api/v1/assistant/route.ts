import { NextRequest, NextResponse } from "next/server";
import { answerQuestion } from "@/lib/assistant";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let body: { question?: string };
  try {
    body = (await request.json()) as { question?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const question = body.question?.trim();
  if (!question) {
    return NextResponse.json({ error: "question is required" }, { status: 400 });
  }

  const result = await answerQuestion(question);
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    question,
    ...result,
  });
}

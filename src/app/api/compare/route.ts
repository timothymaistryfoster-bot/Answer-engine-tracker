import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateWithGemini } from "@/lib/providers/gemini";
import { generateWithOpenAI } from "@/lib/providers/openai";

const requestSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  openaiModel: z.string().min(1).optional(),
  geminiModel: z.string().min(1).optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, openaiModel, geminiModel } = requestSchema.parse(body);

    const [openaiResult, geminiResult] = await Promise.allSettled([
      generateWithOpenAI({ prompt, model: openaiModel }),
      generateWithGemini({ prompt, model: geminiModel })
    ]);

    const results: Record<string, { model: string; text: string } | { error: string }> = {};

    if (openaiResult.status === "fulfilled") {
      results.openai = { model: openaiResult.value.model, text: openaiResult.value.text };
      await prisma.queryLog.create({
        data: {
          provider: "openai",
          model: openaiResult.value.model,
          prompt,
          response: openaiResult.value.text
        }
      });
    } else {
      results.openai = { error: openaiResult.reason?.message ?? "OpenAI failed" };
    }

    if (geminiResult.status === "fulfilled") {
      results.gemini = { model: geminiResult.value.model, text: geminiResult.value.text };
      await prisma.queryLog.create({
        data: {
          provider: "gemini",
          model: geminiResult.value.model,
          prompt,
          response: geminiResult.value.text
        }
      });
    } else {
      results.gemini = { error: geminiResult.reason?.message ?? "Gemini failed" };
    }

    return NextResponse.json({ prompt, results });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

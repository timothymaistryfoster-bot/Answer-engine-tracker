import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateText } from "@/lib/providers";

const requestSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  provider: z.enum(["openai", "gemini"]).optional(),
  model: z.string().min(1).optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, provider, model } = requestSchema.parse(body);

    const result = await generateText(prompt, provider, model);

    const saved = await prisma.queryLog.create({
      data: {
        provider: result.provider,
        model: result.model,
        prompt,
        response: result.text
      }
    });

    return NextResponse.json({
      id: saved.id,
      provider: result.provider,
      model: result.model,
      response: result.text,
      createdAt: saved.createdAt
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

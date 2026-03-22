import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: "ok",
      database: "connected",
      providers: {
        openai: Boolean(process.env.OPENAI_API_KEY),
        gemini: Boolean(process.env.GEMINI_API_KEY)
      },
      timestamp: new Date().toISOString(),
      latencyMs: Date.now() - startedAt
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown healthcheck error";

    return NextResponse.json(
      {
        status: "degraded",
        database: "disconnected",
        error: message,
        timestamp: new Date().toISOString(),
        latencyMs: Date.now() - startedAt
      },
      { status: 503 }
    );
  }
}

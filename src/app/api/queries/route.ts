import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.queryLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      provider: true,
      model: true,
      prompt: true,
      response: true,
      createdAt: true
    }
  });

  return NextResponse.json({ items });
}

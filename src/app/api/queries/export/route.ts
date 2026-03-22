import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const items = await prisma.queryLog.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      provider: true,
      model: true,
      prompt: true,
      response: true,
      createdAt: true
    }
  });

  const header = ["id", "provider", "model", "createdAt", "prompt", "response"];

  const escape = (value: string) =>
    `"${String(value).replace(/"/g, '""').replace(/\n/g, " ")}"`;

  const rows = items.map((item) =>
    [
      escape(item.id),
      escape(item.provider),
      escape(item.model),
      escape(item.createdAt.toISOString()),
      escape(item.prompt),
      escape(item.response)
    ].join(",")
  );

  const csv = [header.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="query-logs-${new Date().toISOString().slice(0, 10)}.csv"`
    }
  });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const groups = await prisma.studyGroup.findMany({
      include: {
        _count: { select: { notes: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ groups });
  } catch (error) {
    console.error("GET Groups error:", error);
    return NextResponse.json({ error: "Failed to fetch study groups" }, { status: 500 });
  }
}

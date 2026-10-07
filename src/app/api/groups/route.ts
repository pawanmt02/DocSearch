import { NextResponse } from "next/server";
import { prisma, DEMO_GROUPS } from "@/lib/prisma";

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
    console.warn("GET Groups error, returning DEMO_GROUPS:", error);
    return NextResponse.json({ groups: DEMO_GROUPS });
  }
}


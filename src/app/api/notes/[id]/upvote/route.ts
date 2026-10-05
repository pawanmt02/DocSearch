import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Increment upvote count
    const updatedNote = await prisma.note.update({
      where: { id },
      data: {
        upvotes: { increment: 1 },
      },
    });

    return NextResponse.json({
      success: true,
      upvotes: updatedNote.upvotes,
    });
  } catch (error) {
    console.error("Upvote API Error:", error);
    return NextResponse.json(
      { error: "Failed to process upvote" },
      { status: 500 }
    );
  }
}

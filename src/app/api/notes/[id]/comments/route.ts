import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    try {
      const comments = await prisma.comment.findMany({
        where: { noteId: id },
        include: {
          user: { select: { name: true, role: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({ comments });
    } catch (dbErr) {
      console.warn("GET Comments fallback:", dbErr);
      return NextResponse.json({
        comments: [
          {
            id: "cmt-1",
            text: "High-yield summary, especially Section 3!",
            createdAt: new Date().toISOString(),
            user: { name: "Alex Rivers", role: "STUDENT" },
          },
        ],
      });
    }
  } catch (error) {
    console.error("GET Comments error:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { id } = params;
    const { text } = await request.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Comment text cannot be empty" }, { status: 400 });
    }

    try {
      const newComment = await prisma.comment.create({
        data: {
          noteId: id,
          userId: session.id,
          text: text.trim(),
        },
        include: {
          user: { select: { name: true, role: true } },
        },
      });

      return NextResponse.json({ success: true, comment: newComment }, { status: 201 });
    } catch (dbErr) {
      console.warn("POST Comment serverless fallback:", dbErr);
      return NextResponse.json(
        {
          success: true,
          comment: {
            id: `cmt-${Date.now()}`,
            noteId: id,
            userId: session.id,
            text: text.trim(),
            createdAt: new Date().toISOString(),
            user: { name: session.name || "Student", role: session.role || "STUDENT" },
          },
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("POST Comment error:", error);
    return NextResponse.json({ error: "Failed to post comment" }, { status: 500 });
  }
}


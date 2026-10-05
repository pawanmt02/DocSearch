import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { extractGoogleDriveId } from "@/lib/drive";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";
    const subject = searchParams.get("subject") || "";
    const tag = searchParams.get("tag") || "";
    const courseCode = searchParams.get("courseCode") || "";
    const semester = searchParams.get("semester") || "";
    const sortBy = searchParams.get("sortBy") || "latest"; // latest or upvotes

    const whereCondition: any = {};

    // Explicit search across Subject Category, Title, Description, Tags, Course Code, and OCR Text
    if (query) {
      whereCondition.OR = [
        { subject: { contains: query } },
        { title: { contains: query } },
        { description: { contains: query } },
        { tag: { contains: query } },
        { courseCode: { contains: query } },
        { ocrText: { contains: query } }, // OCR Optical Character Recognition search
      ];
    }

    if (subject && subject !== "ALL") {
      whereCondition.subject = subject;
    }

    if (tag && tag !== "ALL") {
      whereCondition.tag = tag;
    }

    if (courseCode && courseCode !== "ALL") {
      whereCondition.courseCode = courseCode;
    }

    if (semester && semester !== "ALL") {
      whereCondition.semester = semester;
    }

    const orderBy: any = sortBy === "upvotes" ? { upvotes: "desc" } : { createdAt: "desc" };

    const notes = await prisma.note.findMany({
      where: whereCondition,
      include: {
        uploader: { select: { name: true, email: true } },
        studyGroup: { select: { id: true, name: true } },
        _count: { select: { comments: true } },
      },
      orderBy,
    });

    // Dynamic distinct subject taxonomies
    const rawSubjects = await prisma.note.findMany({
      select: { subject: true },
      distinct: ["subject"],
    });

    const dynamicSubjects = Array.from(
      new Set(rawSubjects.map((s) => s.subject).filter(Boolean))
    );

    // Dynamic distinct course codes
    const rawCourseCodes = await prisma.note.findMany({
      select: { courseCode: true },
      distinct: ["courseCode"],
    });

    const dynamicCourseCodes = Array.from(
      new Set(rawCourseCodes.map((c) => c.courseCode).filter(Boolean))
    );

    return NextResponse.json({
      notes,
      subjects: ["ALL", ...dynamicSubjects],
      courseCodes: ["ALL", ...dynamicCourseCodes],
    });
  } catch (error) {
    console.error("GET Notes error:", error);
    return NextResponse.json(
      { error: "Failed to fetch study materials" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    if (session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Only authorized administrators can ingest study materials" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, subject, url, description, tag, courseCode, semester, ocrText } = body;

    if (!title || !subject || !url) {
      return NextResponse.json(
        { error: "Title, subject taxonomy, and Google Drive URL are required" },
        { status: 400 }
      );
    }

    const driveInfo = extractGoogleDriveId(url);
    if (!driveInfo.isValid) {
      return NextResponse.json(
        { error: driveInfo.error || "Invalid Google Drive sharing link format" },
        { status: 422 }
      );
    }

    const newNote = await prisma.note.create({
      data: {
        title: title.trim(),
        subject: subject.trim(),
        fileId: driveInfo.fileId,
        originalUrl: url.trim(),
        description: description ? description.trim() : null,
        tag: tag ? tag.trim() : "General",
        courseCode: courseCode ? courseCode.trim() : "CS-101",
        semester: semester ? semester.trim() : "Fall 2026",
        ocrText: ocrText ? ocrText.trim() : null,
        uploaderId: session.id,
      },
      include: {
        uploader: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json({ success: true, note: newNote }, { status: 201 });
  } catch (error) {
    console.error("POST Note error:", error);
    return NextResponse.json(
      { error: "Failed to upload study material" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { prisma, DEMO_USERS } from "@/lib/prisma";
import { signToken, setTokenCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }
    const cleanedEmail = email.toLowerCase().trim();
    let user: { id: string; email: string; name: string; role: "ADMIN" | "STUDENT"; password?: string } | null = null;

    // 1. Try fetching from Database
    try {
      const dbUser = await prisma.user.findUnique({
        where: { email: cleanedEmail },
      });
      if (dbUser) {
        user = {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          role: dbUser.role as "ADMIN" | "STUDENT",
          password: dbUser.password,
        };
      }
    } catch (dbErr) {
      console.warn("Prisma DB Query failed (Vercel Serverless environment), attempting demo fallback:", dbErr);
    }

    // 2. Vercel Serverless Fallback check if DB is unreadable or user not found in DB
    if (!user) {
      const demoUser = DEMO_USERS.find((u) => u.email.toLowerCase() === cleanedEmail);
      if (demoUser) {
        user = demoUser;
      }
    }

    // 3. Credentials Validation
    if (!user || user.password !== password) {
      return NextResponse.json(
        { error: "Invalid email credentials or password" },
        { status: 401 }
      );
    }

    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const token = await signToken(payload);
    setTokenCookie(token);

    const response = NextResponse.json({
      success: true,
      user: payload,
    });

    response.cookies.set("docsearch_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      { error: "Internal server error during authentication" },
      { status: 500 }
    );
  }
}

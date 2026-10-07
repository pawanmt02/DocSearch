import { NextResponse } from "next/server";
import { prisma, DEMO_USERS } from "@/lib/prisma";
import { signToken, setTokenCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON request body" }, { status: 400 });
    }

    const { email, password } = body || {};

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }
    const cleanedEmail = String(email).toLowerCase().trim();
    let user: { id: string; email: string; name: string; role: "ADMIN" | "STUDENT"; password?: string } | null = null;

    // 1. Try fetching from Database (safely handled if DB is uninitialized on Vercel)
    try {
      if (prisma && prisma.user) {
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

    let token = "";
    try {
      token = await signToken(payload);
    } catch (tokenErr) {
      console.warn("Token signing fallback:", tokenErr);
    }

    if (token) {
      setTokenCookie(token);
    }

    const response = NextResponse.json({
      success: true,
      user: payload,
    });

    if (token) {
      response.cookies.set("docsearch_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 1 day
        path: "/",
      });
    }

    return response;
  } catch (error: any) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error during authentication",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}


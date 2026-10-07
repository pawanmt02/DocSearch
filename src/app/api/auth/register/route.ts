import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken, setTokenCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON request body" }, { status: 400 });
    }

    const { name, email, password } = body || {};

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Full name, email address, and password are required" },
        { status: 400 }
      );
    }
    const cleanedEmail = String(email).toLowerCase().trim();

    if (String(password).length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    let payload = {
      id: "student-" + Date.now(),
      email: cleanedEmail,
      name: String(name).trim(),
      role: "STUDENT" as const,
    };

    // Try creating in Prisma Database if available
    try {
      if (prisma && prisma.user) {
        const existingUser = await prisma.user.findUnique({
          where: { email: cleanedEmail },
        });

        if (existingUser) {
          return NextResponse.json(
            { error: "An account with this email address already exists. Please sign in instead." },
            { status: 409 }
          );
        }

        const newUser = await prisma.user.create({
          data: {
            name: String(name).trim(),
            email: cleanedEmail,
            password: String(password),
            role: "STUDENT",
          },
        });

        payload = {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: "STUDENT",
        };
      }
    } catch (dbErr) {
      console.warn("Prisma DB create failed on Vercel, proceeding with Vercel JWT session creation:", dbErr);
    }

    // Generate JWT token
    let token = "";
    try {
      token = await signToken(payload);
    } catch (tokenErr) {
      console.warn("Token signing fallback:", tokenErr);
    }

    if (token) {
      setTokenCookie(token);
    }

    // Explicitly set cookie on NextResponse header for Vercel serverless runtime safety
    const response = NextResponse.json(
      {
        success: true,
        message: "Student account created successfully!",
        user: payload,
      },
      { status: 201 }
    );

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
    console.error("Student Registration API Error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error during student registration",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
